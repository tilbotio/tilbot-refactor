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
  let variableElementSelect: HTMLSelectElement;
  let windowApi: any;
  let saveButton: HTMLButtonElement;

  let variableSelected: any = $state();
  let variableElementSelected: any = $state();

  onMount(() => {
    windowApi = (window as any).api;
  });

  async function variableSelectChange() {
    if (variableSelect.selectedIndex !== 0) {
      saveButton.classList.remove("disabled");
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
    {#if variables === undefined || variables.length == 0}
      No variables are defined in this project yet.
    {:else}
      <select
        class="select"
        bind:this={variableSelect}
        bind:value={variableSelected}
        onchange={variableSelectChange}
      >
        <option disabled selected>Pick a variable</option>
        {#each variables as v}
          <option>{v.name}</option>
        {/each}
      </select>

      {#if variableSelected !== undefined && variableSelected !== "Pick a variable"}
        <select
          class="select"
          bind:this={variableElementSelect}
          bind:value={variableElementSelected}
        >
          <option selected>Column from dataset</option>
          <option selected>Random row</option>
        </select>
      {/if}

      {#if colNames !== null && variableElementSelected !== undefined && variableElementSelected == "Column from dataset"}
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
          class="btn btn-primary disabled"
          bind:this={saveButton}
          onclick={() => {
            onSave(
              variableSelect.value,
              colSelect !== undefined ? colSelect.value : "",
              variableElementSelected == "Random row"
            );
          }}>Save</button
        >
      </form>
    </div>
  </div>
</dialog>
