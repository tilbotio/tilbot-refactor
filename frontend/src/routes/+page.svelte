<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";
  import { setContext, onMount } from "svelte";
  import { ChatOutput } from "$lib/classes/ChatOutput.svelte";
  import { ChatLookup } from "$lib/classes/ChatLookup";
  import { ChatLogger } from "$lib/classes/ChatLogger";
  import { RemoteProjectController } from "../../../common/projectcontroller/remote";
  import { LocalProjectController } from "../../../common/projectcontroller/local";
  import type { ProjectControllerInterface } from "../../../common/projectcontroller/types";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import type { Message } from "$lib/types/types";
  import type { ProjectSettings } from "../../../common/project/types";

  let { data: loadResult }: PageProps = $props();

  // Set to $state to allow for future functionality
  let runtimeContext: RuntimeContext = $state(loadResult.runtimeContext);
  let settingsContext: ProjectSettings = $state(loadResult.settings);

  let messages = $state<Message[]>([]);
  setContext("messagesContext", messages);

  setContext("runtimeContext", runtimeContext);
  setContext("settingsContext", settingsContext);

  const chatOutput = new ChatOutput(settingsContext, runtimeContext);
  let projectController: ProjectControllerInterface<ChatOutput> = $state(
    new RemoteProjectController(chatOutput)
  );

  $effect(() => {
    chatOutput.projectController = projectController;
  });

  onMount(async () => {
    window.addEventListener("message", messageReceived, false);
  });

  async function messageReceived(event: MessageEvent) {
    if (event.data.project !== undefined) {
      projectReceived(event.data);
    } else {
      if (event.data.startsWith("log:")) {
        projectController.log(event.data.substring(5));
      } else if (event.data.startsWith("chatgpt|")) {
        sendChatGPTMessage(event.data.substring(8));
      } else if (event.data.startsWith("variation|")) {
        variation_message(event.data.substring(10));
      } else {
        projectController.output.processMessage("user", event.data);
      }
    }
  }

  function sendChatGPTMessage(messageText: string): void {
    projectController.output.processMessage("chatgpt", messageText);
  }

  function projectReceived(data: any): void {
    messages = [];
    // TODO: Add logic to set currentMessageType to text, might need to move that state to runtimeContext
    const chatLookup = new ChatLookup();
    const chatLogger = new ChatLogger();
    projectController = new LocalProjectController(
      chatLookup,
      chatOutput,
      chatLogger,
      data.project
    );
    let windowmsg = {
      msg: "reset_var_mem",
    };
    window.parent.postMessage(windowmsg);
  }

  function variation_message(data: any): void {
    // Nog toe te voegen
  }
</script>

<ChatView {projectController} />
