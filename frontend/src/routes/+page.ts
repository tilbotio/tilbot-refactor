import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, fetch }) => {
  const showHeaderParam = url.searchParams.get("show_header");
  const showHeader = showHeaderParam !== null ? showHeaderParam === "1" : true;
  return {
    showHeader,
  };
};
