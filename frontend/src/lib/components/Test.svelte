<script lang="ts">
    // We use contexts here to retrieve the variables.
    import { getContext } from "svelte";
    import type { RuntimeContext } from "../types/RuntimeContext";
    import type { ChatSettings } from "../../../../common/ChatSettings";


    const runtime: RuntimeContext = getContext("runtime-context");
    const settings: ChatSettings = getContext("settings-context");

</script>

<h1>Hi there, {settings.name}. Did you know that the typing speed is set to {runtime.path}!</h1>