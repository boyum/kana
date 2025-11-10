import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  const { supabase, session } = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const listId = url.searchParams.get('listId');
  const days = parseInt(url.searchParams.get('days') || '30');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Build query for daily stats
    let query = supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Filter by list if provided
    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data: dailyStats, error: statsError } = await query;

    if (statsError) {
      throw error(500, `Failed to fetch stats: ${statsError.message}`);
    }

    // Calculate summary statistics
    const summary = {
      totalSessions: dailyStats?.reduce((sum, day) => sum + day.sessions_count, 0) || 0,
      totalCardsReviewed: dailyStats?.reduce((sum, day) => sum + day.cards_reviewed, 0) || 0,
      totalCorrect: dailyStats?.reduce((sum, day) => sum + day.correct_answers, 0) || 0,
      totalIncorrect: dailyStats?.reduce((sum, day) => sum + day.incorrect_answers, 0) || 0,
      totalDurationMs: dailyStats?.reduce((sum, day) => sum + day.total_duration_ms, 0) || 0,
      averageAccuracy: dailyStats?.length
        ? dailyStats.reduce((sum, day) => sum + (day.accuracy_percentage || 0), 0) / dailyStats.length
        : 0,
      averageResponseTime: dailyStats?.length
        ? Math.round(
            dailyStats.reduce((sum, day) => sum + (day.average_response_time_ms || 0), 0) /
              dailyStats.length
          )
        : 0,
      currentStreak: calculateStreak(dailyStats || []),
    };

    // Get current mastery levels for the list(s)
    let masteryQuery = supabase
      .from('cards')
      .select('mastery_level, list_id');

    if (listId) {
      masteryQuery = masteryQuery.eq('list_id', listId);
    } else {
      // Get all cards from user's lists
      const { data: userLists } = await supabase
        .from('lists')
        .select('id')
        .eq('user_id', session.user.id);

      if (userLists && userLists.length > 0) {
        masteryQuery = masteryQuery.in(
          'list_id',
          userLists.map((l) => l.id)
        );
      }
    }

    const { data: cards } = await masteryQuery;

    const masteryDistribution = {
      new: cards?.filter((c) => c.mastery_level === 0).length || 0,
      learning: cards?.filter((c) => c.mastery_level > 0 && c.mastery_level < 50).length || 0,
      familiar: cards?.filter((c) => c.mastery_level >= 50 && c.mastery_level < 80).length || 0,
      mastered: cards?.filter((c) => c.mastery_level >= 80).length || 0,
    };

    return json({
      dailyStats,
      summary,
      masteryDistribution,
    });
  } catch (e) {
    console.error('Error fetching progress stats:', e);
    throw error(500, 'Failed to fetch progress statistics');
  }
};

// Calculate current streak of consecutive days with activity
function calculateStreak(dailyStats: Array<{ date: string }>): number {
  if (!dailyStats || dailyStats.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort by date descending
  const sortedStats = [...dailyStats].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentDate = new Date(today);

  for (const stat of sortedStats) {
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);

    // Check if this stat is for the current date we're looking for
    if (statDate.getTime() === currentDate.getTime()) {
      streak++;
      // Move to the previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (statDate.getTime() < currentDate.getTime()) {
      // Gap in the streak
      break;
    }
  }

  return streak;
}
