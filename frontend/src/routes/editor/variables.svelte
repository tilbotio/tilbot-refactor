<script lang="ts">
  import Papa from "papaparse";

  let toggle: HTMLElement;
  let { variables = $bindable([]) } = $props();
  let selectedVariable: number | null = $state(null);
  let currentCSV: any[][] | null = $state(null);

  const window_api: any = (window as any).api;

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

    variables.push({ name: name, type: "csv" });

    currentCSV = null;
    selectedVariable = variables.length - 1;
  }

  async function variableRowClicked(this: HTMLElement) {
    currentCSV = null;
    selectedVariable = parseInt(this.dataset.variableId!);
    const variable = variables[selectedVariable];
    const csvfile = variable.csvfile;
    if (csvfile !== undefined && variable.type == "csv") {
      const csv = await window_api.invoke("get-csv", csvfile);
      currentCSV = Papa.parse(csv, { delimiter: ";" }).data as any[][];
    }
  }

  async function importCSV() {
    const { filename, csv } = await window_api.invoke("load-csv");
    variables[selectedVariable!].csvfile = filename;
    currentCSV = Papa.parse(csv, { delimiter: ";" }).data as any[][];
  }

  function reset() {
    selectedVariable = null;
    currentCSV = null;
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
      onclick={reset}
      onkeyup={reset}>✕</a
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
      <div class="flex-1 px-4">
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
            <div class="overflow-x-auto">
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

          <button class="btn" onclick={importCSV}>Import CSV data</button>
        {/if}
      </div>
    </div>
  </div>
</div>
