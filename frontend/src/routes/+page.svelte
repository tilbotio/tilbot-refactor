<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";
  // Temporary for testing, remove later on:
  import ChatHeader2 from "$lib/components/ChatHeader2.svelte";
  import Test from "$lib/components/Test.svelte";
  import { setContext } from "svelte";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import TestOptional from "$lib/components/TestOptional.svelte";

  let { data: loadResult }: PageProps = $props();
  setContext("settings-context", loadResult.settings);
  setContext("runtime-context", loadResult.runtimeContext);
  setContext("all-context", loadResult);
</script>
<h1>{loadResult.showHeader}</h1>
<!--<ChatView {...loadResult} />-->
<ChatHeader2 showHeader = {loadResult.showHeader} runtimeContext = {loadResult.runtimeContext} settings= {loadResult.settings}/>
<Test />
<!--And here we pass only a few properties of runtimeContext to check if optional parameters can be helpful in this project-->
<TestOptional path={loadResult.runtimeContext.path} participantId={loadResult.runtimeContext.participantId} />
