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
  let filterSelect: HTMLSelectElement;
  let filterColnameSelect: HTMLSelectElement;
  let filterTypeSelect: HTMLSelectElement;
  let filterText: HTMLInputElement;
  let filterVar: HTMLSelectElement;
  let windowApi: any;
  let saveButton: HTMLButtonElement;

  let variableSelected: any = $state();
  let variableElementSelected: any = $state();

  let showFilter: boolean = $state(false);

  onMount(() => {
    windowApi = (window as any).api;
  });

  function filterSelectChange() {
    if (filterSelect.selectedIndex == 1) {
      showFilter = true;
    } else {
      showFilter = false;
    }
  }

  async function variableSelectChange() {
    if (variableSelect.selectedIndex !== 0) {
      saveButton.classList.remove("disabled");
      colNames = null;

      let selectedVar = variables[variableSelect.selectedIndex - 1];

      if (selectedVar.type == "dataset") {
        colNames = await windowApi.invoke(
          "get-data-table-cols",
          variableSelect.value
        );
      } else if (
        selectedVar.type == "session" &&
        selectedVar.valueVariable !== null
      ) {
        colNames = await windowApi.invoke(
          "get-data-table-cols",
          selectedVar.valueVariable
        );
      }
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

      {#if variableSelected !== undefined && variableSelected !== "Pick a variable" && colNames !== null}
        <select
          class="select"
          bind:this={variableElementSelect}
          bind:value={variableElementSelected}
        >
          <option selected>Column from dataset</option>
          <option>Random row</option>
        </select>
      {/if}

      {#if colNames !== null && variableElementSelected !== undefined && variableElementSelected == "Column from dataset"}
        <select class="select" bind:this={colSelect}>
          <option disabled selected value="none">Pick a column name</option>
          {#each colNames as c}
            <option>{c}</option>
          {/each}
        </select>

        <select
          class="select"
          bind:this={filterSelect}
          onchange={filterSelectChange}
        >
          <option selected>All values</option>
          <option value="filter">Values where...</option>
        </select>

        {#if showFilter}
          <select class="select" bind:this={filterColnameSelect}>
            {#each colNames as c}
              <option>{c}</option>
            {/each}
          </select>

          equals

          <select class="select" bind:this={filterTypeSelect}>
            <option selected value="text">Text</option>
            <option value="variable">Variable</option>
          </select>
          {#if filterTypeSelect !== undefined && filterTypeSelect.value == "text"}
            <input type="text" bind:this={filterText} />
          {:else}
            <select class="select" bind:this={filterVar}>
              {#each variables as v}
                {#if v.type == "session" && v.valueVariable === null}
                  <option>{v.name}</option>
                {/if}
              {/each}
            </select>
          {/if}
        {/if}
      {/if}
    {/if}
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Cancel</button>
        <button
          class="btn btn-primary disabled"
          bind:this={saveButton}
          onclick={() => {
            let filter = {};

            if (filterSelect !== undefined && filterSelect.value == "filter") {
              filter.colName = filterColnameSelect.value;
              if (filterTypeSelect.value == "text") {
                filter.match = {
                  type: "text",
                  text: filterText.value,
                };
              } else {
                filter.match = {
                  type: "variable",
                  varName: filterVar.value,
                };
              }
            }

            onSave(
              variables[variableSelect.selectedIndex - 1].type,
              variableSelect.value,
              colSelect !== undefined ? colSelect.value : "",
              variableElementSelected == "Random row",
              filter
            );
          }}>Save</button
        >
      </form>
    </div>
  </div>
</dialog>
