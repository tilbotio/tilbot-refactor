<input type="checkbox" id="my-modal-settings" class="modal-toggle" bind:this={toggle} />
<div class="modal">
    <div class="modal-box relative w-11/12 max-w-full h-5/6 max-h-full">
        <label for="my-modal-settings" class="btn btn-sm btn-circle absolute right-2 top-2" on:click={reset}>✕</label>
        <div class="flex w-full h-full flex-col">
            <div class="flex w-full flex-1">
                <div class="w-64">
                    <!-- List of settings -->
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                        <thead>
                            <tr>
                            <th class="sticky top-0">Project settings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="hover">
                                <td data-setting-id="1" class="cursor-pointer {selected_setting == 1 ? 'bg-tilbot-primary-200' : ''}" on:click={settings_row_clicked}>Typing behavior</td>
                            </tr>
                        </tbody>
                        </table>    

                        <!--<table class="table w-full mt-16">
                        <thead>
                            <tr>
                            <th class="sticky top-0">General settings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="hover">
                                <td data-setting-id="2" class="cursor-pointer {selected_setting == 2 ? 'bg-tilbot-primary-200' : ''}" on:click={settings_row_clicked}>ChatGPT</td>
                            </tr>
                        </tbody>
                        </table>                    -->            
                    </div>     
                </div>
                <div class="flex-1 px-4">
                    <!-- Typing behavior -->
                    {#if selected_setting == 1}
                    <div class="w-full text-xl text-center font-bold">Typing behavior</div>
                    <div class="p-8">
                        <span class="font-bold">Typing speed</span><br />
                        <table class="table w-full">
                            <thead>
                                <th colspan="2">Typing speed</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Variable typing speed (based on text length)</td>
                                    <td><input type="radio" name="radio-1" class="radio" on:change="{typing_style_change}" bind:group="{copy.typing_style}" value="variable" /></td>
                                </tr>
                                {#if copy.typing_style == 'variable'}
                                <tr>
                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;Characters typed per sec</td>
                                    <td><input type="number" bind:value="{copy.typing_charpsec}" min="1" class="input input-sm input-bordered w-24" /></td>
                                </tr>
                                {/if}
                                <tr>
                                    <td>Fixed typing speed</td>
                                    <td><input type="radio" name="radio-1" class="radio" on:change="{typing_style_change}" bind:group="{copy.typing_style}" value="fixed" /></td>
                                </tr>
                                {#if copy.typing_style == 'fixed'}
                                <tr>
                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;Time spent typing (sec)</td>
                                    <td><input type="number" bind:value="{copy.typing_time}" min="1" class="input input-sm input-bordered w-24" /></td>
                                </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                    {/if}
                    <!-- ChatGPT integration -->
                    {#if selected_setting == 2}
                    <div class="w-full text-xl text-center font-bold">ChatGPT integration</div>
                    Note: These settings are stored on this device, and not included in the project file to avoid anyone using your ChatGPT API key and ramping up costs.
                    {/if}
                </div>
            </div>
            <div class="h-24 text-right">
                <div class="divider"></div> 
                <button class="btn btn-active" on:click={save}>Save</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="btn btn-outline" on:click={cancel}>Cancel</button>
            </div>
        </div>
    </div>
</div>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    let toggle: HTMLElement;
    let selected_setting: number = 1;
    export let settings: any;

    const dispatch = createEventDispatcher();

    let copy = {};

    export const settingswindow = {
        show() {
            if (settings == undefined) {
                copy = {
                    'typing_style': 'variable',
                    'typing_time': 2,
                    'typing_charpsec': 40
                }
            }

            else {
                copy = JSON.parse(JSON.stringify(settings));

                // Defaults
                if (copy.typing_style == undefined) {
                    copy.typing_style = 'variable';
                }
                if (copy.typing_time == undefined) {
                    copy.typing_time = 2;
                }
                if (copy.typing_charpsec == undefined) {
                    copy.typing_charpsec = 40;
                }
            }



            toggle.click();
        }
    }

    function typing_style_change() {
        copy.typing_style = event.currentTarget.value;
    }

    function settings_row_clicked() {
        selected_setting = this.dataset.settingId;
    }

    function reset() {
    }

    function cancel() {
        reset();
        toggle.click();
    }

    function save() {
        dispatch('message', {
            event: 'save_settings',
            settings: copy
        });

        reset();
        toggle.click();
    }

</script>