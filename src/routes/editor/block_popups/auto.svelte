<label for="my-modal-3" class="btn btn-sm btn-circle absolute right-2 top-2" on:click={cancel}>✕</label>
<h3 class="text-lg font-bold">
    <svg style="display: inline; vertical-align: sub" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>                          

    <div class="inline" contenteditable="true" bind:textContent={copy.name} on:keypress={name_keypress}></div>
</h3>
<p class="py-4">Text for the bot to say:</p>
<div class="textarea text-base textarea-bordered resize-none inset-y-2 w-full h-24 max-h-40 overflow-scroll" contenteditable="true" bind:innerHTML={copy.content}></div>

<br />

<div class="divider"></div> 
<p><button class="btn btn-active" on:click={save}>Save</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="btn btn-outline" on:click={cancel}>Cancel</button></p>

<script type="ts">
    import { onMount, createEventDispatcher } from "svelte";
    export let objAttributes = {};
    let copy = {};

    const dispatch = createEventDispatcher();

    onMount(() => {
        copy = JSON.parse(JSON.stringify(objAttributes));
    });

    function name_keypress(e: KeyboardEvent) {
        if (e.key == 'Enter') {
            e.preventDefault();
        }
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