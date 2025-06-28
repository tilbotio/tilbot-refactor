<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";
  import Test from "$lib/components/Test.svelte";
  import { setContext } from "svelte";

  let { data: loadResult }: PageProps = $props();
  setContext("settings-context", loadResult.settings);
  setContext("runtime-context", loadResult.runtimeContext);
  setContext("all-context", loadResult);
</script>

<!--<ChatView {...loadResult} />-->
<Test />
