import { extractLocaleFromRequest } from "$lib/paraglide/runtime";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { session }, request }) => {
  let locale = extractLocaleFromRequest(request);

  // If no locale cookie is set, detect from Accept-Language header
  const cookieHeader = request.headers.get('cookie');
  const hasLocaleCookie = cookieHeader?.includes('PARAGLIDE_LOCALE');

  if (!hasLocaleCookie) {
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      // Get the primary language code from Accept-Language header
      const langCode = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      // Map Norwegian variants (no, nn, nb) to nb, everything else to en
      locale = ['no', 'nn', 'nb'].includes(langCode) ? 'nb' : 'en';
    }
  }

  return {
    session,
    locale,
  };
};
