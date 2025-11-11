import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  const { session } = locals;

  if (!session) {
    throw redirect(302, '/login');
  }

  // Fetch initial data on the server side where session is available
  const [statsResponse, sessionsResponse] = await Promise.all([
    fetch('/api/progress/stats?days=30'),
    fetch('/api/progress/sessions?limit=20'),
  ]);

  const stats = statsResponse.ok ? await statsResponse.json() : null;
  const sessionsData = sessionsResponse.ok ? await sessionsResponse.json() : null;

  return {
    initialStats: stats,
    initialSessions: sessionsData?.sessions || [],
  };
};
