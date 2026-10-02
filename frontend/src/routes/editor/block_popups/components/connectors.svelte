<script lang="ts">
  import { BarsArrowDown, Plus, Trash, Variable } from "svelte-heros-v2";
  import Events from "./events.svelte";
  import type { ProjectConnector } from "../../../../../../common/project/types.ts";
  import Variablepopup from "./variablepopup.svelte";

  const {
    connectors,
    variables,
  }: {
    connectors: ProjectConnector[];
    variables: [];
  } = $props();

  let variablePopup: Variablepopup;
  let selectedConnector: number;
  let selectedLabelPart: number;

  function openVariableWindow(id: number, labelid: number) {
    selectedConnector = id;
    selectedLabelPart = labelid;

    variablePopup.showModal();
  }

  function setVariable(
    type: string,
    variable: string,
    column: string,
    isRandomRow: boolean,
    filter: any
  ) {
    connectors[selectedConnector].label[selectedLabelPart].variableType = type;
    connectors[selectedConnector].label[selectedLabelPart].variable = variable;
    if (column !== "") {
      connectors[selectedConnector].label[selectedLabelPart].column = column;
    }
    connectors[selectedConnector].label[selectedLabelPart].filter = filter;
  }

  function addConnector() {
    connectors.push({
      type: "Labeled",
      label: [
        {
          type: "text",
          content: "",
        },
      ],
      targets: [],
    });
  }
</script>

<Variablepopup bind:this={variablePopup} {variables} onSave={setVariable}
></Variablepopup>

{#if connectors.length! > 0}
  <table class="table table-zebra w-full mt-2">
    <!-- head -->
    <thead>
      <tr>
        <th>Answer option</th>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      {#each connectors.entries() as [id, connector] (id)}
        <tr>
          {#if connector.label && (connector.label.length > 1 || (connector.label[0].type !== "else" && connector.label[0].type !== "audio"))}
            <td>
              {#each connector.label?.entries() as [labelid, label_part] (labelid)}
                <!-- @TODO on change of select remove previously set variables etc. from the label -->
                <select
                  bind:value={label_part.type}
                  class="select select-bordered w-full max-w-xs"
                >
                  <option selected value="text">Contains text</option>
                  <option value="variable">Match variable</option>
                </select>
                {#if label_part.type == "text"}
                  <input
                    type="text"
                    placeholder="Type here"
                    class="input input-bordered w-full max-w-xs"
                    bind:value={label_part.content}
                  />
                {:else if label_part.type == "variable"}
                  {#if label_part.variable !== undefined}
                    <div class="badge badge-info mx-2">
                      <Variable class="w-3 h-3 mr-2" />
                      {label_part.column} from {label_part.variable}
                    </div>
                  {/if}

                  <div class="tooltip" data-tip="Insert variable">
                    <button
                      class="btn btn-square btn-outline btn-sm mt-2 mb-2"
                      onclick={() => {
                        openVariableWindow(id, labelid);
                      }}
                    >
                      <Variable class="w-4 h-4" />
                    </button>
                  </div>
                {/if}
              {/each}
            </td>
          {:else}
            <td>
              {#if connector.label && connector.label[0].type === "else"}
                <div class="badge badge-warning mx-2">
                  <BarsArrowDown class="w-3 h-3 mr-2" /> else
                </div>
              {:else if connector.label && connector.label[0].type === "audio"}
                <div class="badge badge-error mx-2">
                  <BarsArrowDown class="w-3 h-3 mr-2" /> audio
                </div>
              {/if}
            </td>
          {/if}
          <td><Events bind:events={connector.events} {variables} /></td>
          <td>
            <button
              class="btn btn-square btn-outline btn-sm"
              onclick={() => {
                connectors.splice(id, 1);
              }}
              ><Trash class="w-6 h-6" />
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <br />
{/if}

<button class="btn gap-2" onclick={addConnector}>
  <Plus class="w-6 h-6" />
</button>
