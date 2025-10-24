<script lang="ts">
  import Connector from "./connector.svelte";
  import type { ProjectConnector } from "../../../../../../common/project/types.ts";
  const {
    connectors,
    ...props
  }: {
    connectors: ProjectConnector[];
    eventHeader: string;
    contentHeader?: string;
    eventSnippet: Function;
    contentSnippet?: Function;
    eventAddLabel: string;
  } = $props();
</script>

{#if connectors?.length! > 0}
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
          remove={() => {
            connectors.splice(id, 1);
          }}
          {...props}
        />
      {/each}
    </tbody>
  </table>
{/if}
