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
  import type { Message, CurrentMessageType } from "$lib/types/types";
  import type { ProjectSettings } from "../../../common/project/types";

  let { data: loadResult }: PageProps = $props();

  // Set to $state to allow for future functionality
  let runtimeContext: RuntimeContext = $state(loadResult.runtimeContext);
  let settingsContext: ProjectSettings = $state(loadResult.settings);

  let messages = $state<Message[]>([]);
  // https://svelte.dev/docs/svelte/compiler-warnings#state_referenced_locally
  setContext("messagesContext", () => messages);
  let currentMessageType: CurrentMessageType = $state("Text");

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
        projectController.output.processMessage("chatgpt", event.data.substring(8));
      } else if (event.data.startsWith("variation|")) {
        variation_message(event.data.substring(10));
      } else {
        projectController.output.processMessage("user", event.data);
      }
    }
  }

  function projectReceived(data: any): void {
    messages = [];
    currentMessageType = "Auto";
    const chatLookup = new ChatLookup();
    const chatLogger = new ChatLogger();
    let highestTimeoutId = setTimeout(";");
    for (var i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
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

<ChatView {projectController} {currentMessageType} />
