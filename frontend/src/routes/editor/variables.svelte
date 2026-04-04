<script lang="ts">
  import { onMount } from "svelte";

  let toggle: HTMLElement;
  let { variables = $bindable([]) } = $props();
  let selectedVariable: number | null = $state(null);
  let prevVariablename: string = "";
  let currentCSV: any[][] | null = $state(null);
  let isSaved: boolean = $state(true);

  let windowApi: any;

  onMount(() => {
    windowApi = (window as any).api;
  });

  // @TODO: sort variables by name alphabetically

  export function show() {
    toggle.click();
  }

  function newVariable() {
    let count = 1;
    let name = "New variable";

    const existing = new Set(variables.map((variable) => variable.name));
    while (existing.has(name)) {
      name = `New variable ${++count}`;
    }

    prevVariablename = name;

    variables.push({ name: name, type: "dataset" });

    currentCSV = null;
    selectedVariable = variables.length - 1;
  }

  async function variableRowClicked(this: HTMLElement) {
    currentCSV = null;
    selectedVariable = parseInt(this.dataset.variableId!);
    prevVariablename = $state.snapshot(variables[selectedVariable].name);

    // @TODO: retrieve existing data from database.

    /*const variable = variables[selectedVariable];
    const csvfile = variable.csvfile;
    if (csvfile !== undefined && variable.type == "csv") {
      const csv = await windowApi.invoke("get-csv", csvfile);
      currentCSV = Papa.parse(csv, { delimiter: ";" }).data as any[][];
    }*/
  }

  async function importExcel() {
    const data = await windowApi.invoke("load-excel");
    currentCSV = data;

    isSaved = currentCSV === null;
  }

  async function saveVariable() {
    if (selectedVariable !== null) {
      isSaved = await windowApi.invoke("save-variable", {
        prevVariablename: prevVariablename,
        name: $state.snapshot(variables[selectedVariable].name),
        data: $state.snapshot(currentCSV),
      });
    }
  }

  function close() {
    selectedVariable = null;
    currentCSV = null;
    toggle.click();
  }
</script>

<input
  type="checkbox"
  id="my-modal-3"
  class="modal-toggle"
  bind:this={toggle}
/>
<div class="modal">
  <div class="modal-box relative w-11/12 max-w-full h-5/6 max-h-full">
    <a
      id="my-modal-3"
      class="btn btn-sm btn-circle absolute right-2 top-2"
      role="button"
      tabindex="0"
      onclick={close}
      onkeyup={close}>✕</a
    >
    <div class="flex w-full h-full">
      <div class="w-64">
        <!-- List of variables -->
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="sticky top-0">Variables</th>
              </tr>
            </thead>
            <tbody>
              {#each variables as variable, i}
                <tr class="hover">
                  <td
                    data-variable-id={i}
                    class="cursor-pointer {selectedVariable == i
                      ? 'bg-tilbot-primary-200'
                      : ''}"
                    onclick={variableRowClicked}>{variable.name}</td
                  >
                </tr>
              {/each}
              <tr>
                <td>
                  <button class="btn w-full" onclick={newVariable}
                    >+ Variable</button
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex-1 px-4 overflow-auto">
        <!-- Variable detail -->
        {#if variables.length == 0}
          <div class="flex w-full h-full justify-center items-center">
            No variables in project.
          </div>
        {:else if selectedVariable == null}
          <div class="flex w-full h-full justify-center items-center">
            No variable selected.
          </div>
        {:else}
          <input
            type="text"
            class="input input-bordered w-full max-w-xs"
            bind:value={variables[selectedVariable].name}
          />
          <br /><br />

          {#if currentCSV != null}
            <div class="overflow-auto max-h-[83%]">
              <table class="table table-compact w-full">
                <thead>
                  <tr>
                    {#each currentCSV[0] as col}
                      <th>{col}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each currentCSV as line, l}
                    {#if l > 0}
                      <tr>
                        {#each line as col}
                          <td>{col}</td>
                        {/each}
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          <button class="btn mt-2" onclick={importExcel}>
            Import Excel file
          </button>

          <button
            class="btn mt-2 ml-8 btn-primary {isSaved &&
            variables[selectedVariable].name == prevVariablename
              ? 'btn-disabled'
              : ''}"
            onclick={saveVariable}
          >
            Save
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>
