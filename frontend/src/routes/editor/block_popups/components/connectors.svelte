<script lang="ts">
  import { Plus, Trash } from "svelte-heros-v2";
  import Events from "./events.svelte";
  import type { ProjectConnector } from "../../../../../../common/project/types.ts";

  const {
    connectors,
    methodSelector,
  }: {
    connectors: ProjectConnector[];
    methodSelector?: boolean;
  } = $props();

  function addConnector() {
    connectors.push({
      type: "Labeled",
      label: "",
      targets: [],
    });
  }
</script>

{#if connectors.length! > 0}
  <table class="table table-zebra w-full mt-2">
    <!-- head -->
    <thead>
      <tr>
        {#if methodSelector}
          <th>Selection method</th>
          <th>User response to match with</th>
        {:else}
          <th>Answer option</th>
        {/if}
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      {#each connectors.entries() as [id, connector] (id)}
        <tr>
          {#if methodSelector}
            <td>
              <select
                bind:value={connector.method}
                class="select select-bordered w-full max-w-xs"
              >
                <option selected value="contains">Contains text</option>
                <option value="barcode">Barcode/QR scan</option>
              </select>
            </td>
          {/if}
          <td
            ><input
              type="text"
              placeholder="Type here"
              class="input input-bordered w-full max-w-xs"
              bind:value={connector.label}
            /></td
          >
          <td><Events events={connector.events} /></td>
          <td
            ><button
              class="btn btn-square btn-outline btn-sm"
              onclick={() => {
                connectors.splice(id, 1);
              }}><Trash class="w-6 h-6" /></button
            ></td
          >
        </tr>
      {/each}
    </tbody>
  </table>

  <br />
{/if}

<button class="btn gap-2" onclick={addConnector}>
  <Plus class="w-6 h-6" />
</button>
