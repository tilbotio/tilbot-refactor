<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";
  import { setContext } from "svelte";
  import { ChatOutput } from "$lib/classes/ChatOutput.svelte";
  import { RemoteProjectController } from "../../../common/projectcontroller/remote";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import type { Message } from "$lib/types/types";
  import type { ProjectSettings } from "../../../common/project/types";

  let { data: loadResult }: PageProps = $props();

  // Set to $state to allow for future functionality
  let runtimeContext: RuntimeContext = $state(loadResult.runtimeContext);
  let settingsContext: ProjectSettings = $state(loadResult.settings);

  let messages = $state<Message[]>([])
  setContext("messagesContext", messages)

  setContext("runtimeContext", runtimeContext);
  setContext("settingsContext", settingsContext);

  const chatOutput = new ChatOutput(settingsContext, runtimeContext);
  const projectController = new RemoteProjectController(chatOutput);

  chatOutput.projectController = projectController;
</script>

<ChatView {projectController} />
