<script lang="ts">
  import type { ExternalLink, ProjectBlockCompute } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import { Sparkles } from "svelte-heros-v2";

  const {
    block,
    variables,
    externalLinks,
    save = (block: ProjectBlockCompute) => {},
    cancel = () => {},
  } = $props();

  const defaultProjectBlock = {use_external_link: false} as ProjectBlockCompute;
</script>

<BaseBlockPopup Icon={Sparkles} {defaultProjectBlock} {block} {variables} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlockCompute)}

  <br />

  <label class="label cursor-pointer">
    <span class="label-text">Connect to external system for processing.</span>
    <input
      type="checkbox"
      class="toggle"
      bind:checked={blockCopy.use_external_link}
    />
  </label>

  {#if blockCopy.use_external_link}
    <select
    class="select select-bordered"
    bind:value={blockCopy.external_link}>
      <option disabled selected>Pick an external system</option>
      {#each externalLinks as e}
        <option>{e.name}</option>
      {/each}
    </select>   
    <br /> 
  {/if}

    <br /><br />

    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} {variables} />
  {/snippet}
</BaseBlockPopup>
