<input type="checkbox" id="my-modal-3" class="modal-toggle" bind:this={toggle} />
<div class="modal">
    <div class="modal-box relative w-11/12 max-w-full h-5/6 max-h-full">
        <label for="my-modal-3" class="btn btn-sm btn-circle absolute right-2 top-2" on:click={reset}>✕</label>
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
                            <td data-variable-id="{i}" class="cursor-pointer {selected_variable == i ? 'bg-tilbot-primary-200' : ''}" on:click={variable_row_clicked}>{variable.name}</td>
                        </tr>
                        {/each}
                        <tr>
                            <td>
                                <button class="btn w-full" on:click={new_variable}>+ Variable</button>
                            </td>
                        </tr>
                      </tbody>
                    </table>           
                </div>     
            </div>
            <div class="flex-1 px-4">
                <!-- Variable detail -->
                {#if variables.length == 0}
                <div class="flex w-full h-full justify-center items-center">No variables in project.</div>
                {:else}
                    {#if selected_variable == -1}
                    <div class="flex w-full h-full justify-center items-center">No variable selected.</div>
                    {:else}
                    <input type="text" class="input input-bordered w-full max-w-xs" bind:value={variables[selected_variable].name} />
                    <br /><br />

                    {#if current_csv !== undefined}
                        <div class="overflow-x-auto">
                            <table class="table table-compact w-full">
                              <thead>
                                <tr>
                                    {#each current_csv[0] as col, c}
                                    <th>{col}</th> 
                                    {/each}
                                </tr>
                              </thead> 
                              <tbody>
                                {#each current_csv as line, l}
                                {#if l > 0}        
                                <tr>
                                    {#each line as col, c}
                                    <td>{col}</td>
                                    {/each}
                                {/if}
                                {/each}
                              </tbody> 
                            </table>
                          </div>                        

                    {/if}

                    <button class="btn" on:click="{import_csv}">Import CSV data</button>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import Papa from "papaparse";

    let toggle: HTMLElement;
    export let variables: Array<any>;
    let selected_variable: number = -1;
    let current_csv: any = undefined;

    // @TODO: sort variables by name alphabetically

    export const variablewindow = {
        show() {
            toggle.click();
        }
    }

    onMount(() => {
        // Only works in Electron for now. @TODO: implement for online version of Tilbot.
        if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {

            window.api.receive('csv-load', (param: any) => {
                variables[selected_variable].csvfile = param.filename;
                current_csv = Papa.parse(param.csv).data;
            });
        }
    });

    function new_variable() {
        let exists = true;
        let count = 1;

        while (exists) {
            exists = false;
            let name = 'New variable';
            if (count > 1) {
                name += ' ' + count;
            }

            for (let i = 0; i < variables.length; i++) {
                if (variables[i].name == name) {
                    exists = true;
                    break;
                }
            }

            if (exists) {
                count += 1;
            }            
        }

        
        let name = 'New variable';
        if (count > 1) {
            name += ' ' + count;
        }

        variables.push({
            name: name,
            type: 'csv'
        });

        current_csv = undefined;
        selected_variable = variables.length-1;        
    }

    function variable_row_clicked() {
        current_csv = undefined;
        selected_variable = this.dataset.variableId;

        if (variables[selected_variable].type == 'csv' && variables[selected_variable].csvfile !== undefined) {
            window.api.send('get-csv', variables[selected_variable].csvfile);
        }
    }

    function import_csv() {
        window.api.send('do-load-csv-data');
    }

    function reset() {
        selected_variable = -1;
        current_csv = undefined;

    }
</script>