<script lang="ts">
  import type { ExternalLink, ExternalLinkParameter, ProjectBlockCompute } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import { Plus, Sparkles, Trash } from "svelte-heros-v2";

  const {
    block,
    variables,
    externalLinks,
    save = (block: ProjectBlockCompute) => {},
    cancel = () => {},
  } = $props();

  const defaultProjectBlock = {
    use_external_link: false,
    parameters: [] as ExternalLinkParameter[],
  } as ProjectBlockCompute;

  function addParameter(blockCopy: ProjectBlockCompute): void {
    if (blockCopy.parameters === undefined) {
      blockCopy.parameters = [];
    }
    blockCopy.parameters.push({ key: "", value: "" });
  }
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

    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each blockCopy.parameters ?? [] as param, index}
          <tr>
            <td><input type="text" class="input input-bordered" bind:value={param.key} /></td>
            <td><textarea class="input input-bordered" bind:value={param.value}></textarea></td>
            <td>
              <button
                class="btn btn-square btn-outline btn-sm"
                onclick={() => { blockCopy.parameters?.splice(index, 1); }}
                ><Trash class="w-6 h-6" /></button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <br />
    <button class="btn gap-2" onclick={() => addParameter(blockCopy)}>
      <Plus class="w-6 h-6" />
    </button>
  {/if}

    <br /><br />

    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} {variables} />
  {/snippet}
</BaseBlockPopup>
