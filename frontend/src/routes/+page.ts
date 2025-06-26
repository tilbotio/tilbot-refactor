import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, fetch }) => {
  const showHeaderParam = url.searchParams.get("show_header") || "1";
  const participantId = url.searchParams.get("pid") || null;
  const projectId = url.searchParams.get("project") || null;
  const showHeader = showHeaderParam === "1";
  let path: string = "";
  let conversationId: string | null = null;
  let settings: any = {
    typingStyle: "fixed",
    typingTime: 2,
    typingCharPSec: 40,
    showAvatar: true,
    avatarFile: "",
    name: "Tilbot",
  };

  if (projectId) {
    path = `/proj_pub/${projectId}`;
    try {
      const response = await fetch(
        `/api/create_conversation?id=${encodeURIComponent(projectId)}`
      );

      if (response.ok) {
        ({ conversation: conversationId, settings } = await response.json());
        console.log(settings);
      } else {
        throw new Error(
          `Invalid response: ${response.status} ${response.statusText}`
        );
      }
    } catch (err: any) {
      console.error(`Failed to fetch conversation data: ${err.message}`);
    }
  }

  return {
    showHeader,
    participantId,
    path,
    projectId,
    settings,
    conversationId,
  };
};
