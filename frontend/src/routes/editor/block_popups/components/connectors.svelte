<script lang="ts">
  import { Plus } from "svelte-heros-v2";
  import Connector from "./connector.svelte";
  import type { ProjectConnector } from "../../../../../../common/project/types.ts";

  const {
    connectors,
    connectorHeader,
    contentHeader,
    allowAddRemove = true,
    ...props
  }: {
    connectors: ProjectConnector[];
    allowAddRemove?: boolean;
    connectorHeader: string;
    contentHeader?: string;
    children: Function;
    eventAddLabel: string;
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
        <th>Answer option</th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each connectors.entries() as [id, connector] (id)}
        <Connector
          {connector}
          {...allowAddRemove // conditional properties are awkward in svelte.
            ? {
                remove: () => {
                  connectors.splice(id, 1);
                },
              }
            : {}}
          {...props}
        />
      {/each}
    </tbody>
  </table>

  {#if allowAddRemove}
    <br />
  {/if}
{/if}

{#if allowAddRemove}
  <button class="btn gap-2" onclick={addConnector}>
    <Plus class="w-6 h-6" />
  </button>
{/if}
