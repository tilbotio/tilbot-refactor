import type { PageLoad } from "./$types";
import type { RuntimeContext } from "$lib/types/RuntimeContext";
import type { ChatSettings } from "../../../common/ChatSettings"

export const load: PageLoad = ({ url, fetch }) => {
  const showHeaderParam = url.searchParams.get("show_header") || "1";
  
  const runtimeContext: RuntimeContext = {
    path: "",
    conversationId: null,
    // As showHeader is not altered in the application, we do not consider it a state
    showHeader: showHeaderParam === "1",
    participantId: url.searchParams.get("pid") || null,
    projectId: url.searchParams.get("project") || null,
  };

  let settings: ChatSettings = {
    typingStyle: "fixed",
    typingTime: 2,
    typingCharPSec: 40,
    showAvatar: true,
    avatarFile: "",
    name: "Tilbot",
    chatbotAvatarFile: ""
  };

  if (runtimeContext.projectId) { 
    const id = runtimeContext.projectId;
    ( async() => {
    runtimeContext.path = `/proj_pub/${id}`;
    try {
      const response = await fetch(
        `/api/create_conversation?id=${encodeURIComponent(
          id
        )}`
      );

      if (response.ok) {
        ({ conversation: runtimeContext.conversationId, settings } =
          await response.json());
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
)};

  return {
    settings,
    runtimeContext,
  };
};