import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import type { RuntimeContext } from "$lib/types/RuntimeContext";
import { defaultProjectSettings } from "../../../common/project/types";
import _ from "lodash";

export const load: PageLoad = ({ url, fetch }) => {
  const showHeaderParam = (!browser || window.parent.isTilbotEditor)?"1":url.searchParams.get("show_header") || "1";

  const runtimeContext: RuntimeContext = {
    path: "",
    conversationId: null,
    isTilbotEditor: false,
    // As showHeader is not altered in the application, we do not consider it a state
    showHeader: showHeaderParam === "1",
    participantId: (!browser || window.parent.isTilbotEditor)?null:url.searchParams.get("pid") || null,
    projectId: (!browser || window.parent.isTilbotEditor)?null:url.searchParams.get("project") || null,
  };

  let settings = _.cloneDeep(defaultProjectSettings);

  if (browser) {
    try {
      if (window.parent.isTilbotEditor) {
        runtimeContext.isTilbotEditor = true;
      }
    } catch (e) {
      runtimeContext.isTilbotEditor = false;
      console.log("Not Tilbot Editor");
    }
  }

  // Try to connect to remote server if we have a projectId (server version)
  // or if we're not in the editor/simulator (local server started from editor).
  if (runtimeContext.projectId || !runtimeContext.isTilbotEditor) {
    const id = runtimeContext.projectId;
    (async () => {
      runtimeContext.path = `/proj_pub/${id}`;
      try {
        const response = await fetch(
          `/api/create_conversation?id=${encodeURIComponent(id)}`
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
    })();
  }

  return {
    settings,
    runtimeContext,
  };
};
