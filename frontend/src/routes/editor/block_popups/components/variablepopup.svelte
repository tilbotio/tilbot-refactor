<script lang="ts">
  import { onMount } from "svelte";

  let {
    variables = $bindable(),
    onSave = $bindable(),
  }: {
    variables?: any[];
    onSave?: Function;
  } = $props();

  let variableModal: HTMLDialogElement;
  let colNames: string[] | null = $derived(null);
  let variableSelect: HTMLSelectElement;
  let colSelect: HTMLSelectElement;
  let windowApi: any;

  onMount(() => {
    windowApi = (window as any).api;
  });

  async function variableSelectChange() {
    if (variableSelect.selectedIndex !== 0) {
      colNames = await windowApi.invoke(
        "get-data-table-cols",
        variableSelect.value
      );
    }
  }

  export function showModal() {
    variableModal.showModal();
  }
</script>

<dialog id="modal_add_variable" class="modal" bind:this={variableModal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold mb-4">Insert variable</h3>
    {#if variables.length == 0}
      No variables are defined in this project yet.
    {:else}
      <select
        class="select"
        bind:this={variableSelect}
        onchange={variableSelectChange}
      >
        <option disabled selected>Pick a variable</option>
        {#each variables as v}
          <option>{v.name}</option>
        {/each}
      </select>

      {#if colNames !== null}
        <select class="select" bind:this={colSelect}>
          <option disabled selected>Pick a column name</option>
          {#each colNames as c}
            <option>{c}</option>
          {/each}
        </select>
      {/if}
    {/if}
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Cancel</button>
        <button
          class="btn btn-primary"
          onclick={() => {
            onSave(variableSelect.value, colSelect.value);
          }}>Save</button
        >
      </form>
    </div>
  </div>
</dialog>
