<input type="checkbox" id="modal-event" class="modal-toggle" bind:this={modal_event}/>
<div class="modal">
  <div class="modal-box max-w-3xl">
    <h3 class="font-bold text-lg">Events for connector</h3>

    {#if events_copy.length > 0}
    <table class="table table-zebra w-full mt-2">
        <!-- head -->
        <thead>
          <tr>
            <th>Event type</th>
            <th>Content</th>
            <th></th>
          </tr>
        </thead>
        <tbody>

        {#each Object.entries(events_copy) as [id, event]}
        <tr>
            <td>
                <select bind:value={event.type} class="select select-bordered w-full max-w-xs">
                    <option selected value="message">Message to parent window</option>
                    <option value="variable">Set variable</option>
                </select>                    
            </td>
            <!-- @TODO: different inputs for different event types -->
            {#if event.type == 'message'}
            <td><input type="text" placeholder="Message to send to parent window" class="input input-bordered w-full max-w-xs" bind:value={event.content} /></td>
            <td>
                <button class="btn btn-square btn-outline btn-sm" on:click={() => btn_del_event_clicked(id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>                      
                </button>
            </td>
            {:else}
            <td>
                <input type="text" placeholder="Variable" class="input input-bordered max-w-xs" bind:value={event.var_name} /> = 
                <input type="text" placeholder="Value" class="input input-bordered max-w-xs" bind:value={event.var_value} />
            </td>
            <td>
                <button class="btn btn-square btn-outline btn-sm" on:click={() => btn_del_event_clicked(id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>                      
                </button>
            </td>
            {/if}
        </tr>        
        {/each}
        </tbody>
    </table>
    {/if}

    <br /><br />

    <button class="btn gap-2" on:click={btn_add_event_clicked}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg> 
    
        Add event
    </button>

    <div class="divider"></div> 
    <div class="modal-action">
      <div class="btn" on:click="{btn_event_save}">Save</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class="btn btn-outline" on:click="{btn_event_cancel}">Cancel</div>
    </div>
  </div>
</div>

<label for="my-modal-3" class="btn btn-sm btn-circle absolute right-2 top-2" on:click={cancel}>✕</label>
<h3 class="text-lg font-bold">
    <svg style="display: inline; vertical-align: sub" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>                          

    <div class="inline" contenteditable="true" bind:textContent={copy.name} on:keypress={name_keypress}></div>
</h3>
<div class="overflow-x-hidden overflow-y-auto" style="max-height: calc(100vh - 16em)">
    <p class="py-4">Text for the bot to say:</p>
    <div class="textarea text-base textarea-bordered resize-none inset-y-2 w-full max-h-40 h-24 overflow-scroll" contenteditable="true" bind:innerHTML={copy.content}></div>
    

    <br />

    <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Use large language model to add variation</span> 
          <input type="checkbox" class="toggle" bind:checked="{copy.chatgpt_variation}" />
        </label>
    
        {#if copy.chatgpt_variation}
        <textarea class="textarea textarea-bordered w-full" bind:value="{copy.variation_prompt}"></textarea>

        <label class="label cursor-pointer">
            <span class="label-text">Keep memory of previous interactions</span> 
            <input type="checkbox" class="toggle" bind:checked="{copy.chatgpt_memory}" />
        </label>        
        {/if}
    </div>

    <br /><br />
    
    Answer options:<br />
    {#if copy.connectors !== undefined && copy.connectors.length > 0}
    <table class="table table-zebra w-full mt-2">
        <!-- head -->
        <thead>
          <tr>
            <th>Selection method</th>
            <th>User response to match with</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
            {#each Object.entries(copy.connectors) as [id, connector]}
            {#if connector.label == '[else]'}
            <tr>
                <td>
                </td>
                <td>[else]</td>
                <td>
                    <button class="btn btn-square btn-sm {(connector.events === undefined || connector.events.length == 0) ? 'btn-outline' : ''}" on:click={() => btn_event(id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </button>
                </td>
                <td>
                </td>
            </tr>            
            {:else}
            <tr>
                <td>
                    <select bind:value={connector.method} class="select select-bordered w-full max-w-xs">
                        <option selected value="contains">Contains text</option>
                        <option value="barcode">Barcode/QR scan</option>
                    </select>                    
                </td>
                <td><input type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" bind:value={connector.label} /></td>
                <td>
                    <button class="btn btn-square btn-sm {connector.events === undefined ? 'btn-outline' : ''}" on:click={() => btn_event(id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                          </svg>
                    </button>
                </td>
                <td>
                    <button class="btn btn-square btn-outline btn-sm" on:click={() => btn_del_option_clicked(id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>                      
                    </button>
                </td>
            </tr>
            {/if}
            {/each}
        </tbody>
      </table>
      {/if}
    
      <br />
    
      <button class="btn gap-2" on:click={btn_add_option_clicked}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg> 
    
        Add answer option
      </button>
    
    </div>
<div class="divider"></div> 
<p><button class="btn btn-active" on:click={save}>Save</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="btn btn-outline" on:click={cancel}>Cancel</button></p>

<script type="ts">
    import { onMount, createEventDispatcher } from "svelte";
    export let objAttributes = {};
    let copy = {};

    let modal_event: HTMLInputElement;
    let events_copy = []; 
    let edit_event_id: number = -1;

    const dispatch = createEventDispatcher();

    onMount(() => {
        copy = JSON.parse(JSON.stringify(objAttributes));
        if (copy.chatgpt_variation === undefined) {
            copy.chatgpt_variation = false;
        }
        if (copy.variation_prompt === undefined) {
            copy.variation_prompt = 'Please generate a variation of the message the user sends, while preserving its original meaning. Try to be somewhat concise.';
        }        
    });

    function name_keypress(e: KeyboardEvent) {
        if (e.key == 'Enter') {
            e.preventDefault();
        }
    }

    function btn_add_option_clicked() {
        copy.connectors.push({
            type: "Labeled",
            label: "",
            targets: []
        });

        copy.connectors = copy.connectors;
    }

    function btn_del_option_clicked(id: number) {
        copy.connectors.splice(id, 1);
        copy.connectors = copy.connectors;
    }

    function btn_add_event_clicked() {
        events_copy.push({
            type: "message",
            content: ""
        });
        events_copy = events_copy;
    }    

    function btn_del_event_clicked(id: number) {
        events_copy.splice(id, 1);
        events_copy = events_copy;
    }    

    function btn_event(id: number) {

        if (copy.connectors[id].events === undefined) {
            events_copy = [];
        }        
        else {
            events_copy = JSON.parse(JSON.stringify(copy.connectors[id].events));
        }

        edit_event_id = id;        
        modal_event.click();
    }

    function btn_event_save() {
        copy.connectors[edit_event_id].events = events_copy;
        modal_event.click();
    }

    function btn_event_cancel() {
        modal_event.click();
    }

    function cancel() {
        dispatch('message', {
            event: 'cancel'
        });
    }

    function save() {
        dispatch('message', {
            event: 'save',
            block: copy
        });
    }
</script>