import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
  const redirectTo = url.searchParams.get("redirectTo") ?? "/";

  return {
    redirectTo,
  };
};
