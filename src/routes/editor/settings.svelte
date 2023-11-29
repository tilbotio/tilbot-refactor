<input type="checkbox" id="my-modal-settings" class="modal-toggle" bind:this={toggle} />
<div class="modal">
    <div class="modal-box relative w-11/12 max-w-full h-5/6 max-h-full">
        <label for="my-modal-settings" class="btn btn-sm btn-circle absolute right-2 top-2" on:click={reset}>✕</label>
        <div class="flex w-full h-full flex-col">
            <div class="flex w-full" style="height: calc(100% - 6rem)">
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
                                <td data-setting-id="0" class="cursor-pointer {selected_setting == 0 ? 'bg-tilbot-primary-200' : ''}" on:click={settings_row_clicked}>Appearance</td>
                            </tr>
                            <tr class="hover">
                                <td data-setting-id="1" class="cursor-pointer {selected_setting == 1 ? 'bg-tilbot-primary-200' : ''}" on:click={settings_row_clicked}>Typing behavior</td>
                            </tr>
                            <tr class="hover">
                                <td data-setting-id="2" class="cursor-pointer {selected_setting == 2 ? 'bg-tilbot-primary-200' : ''}" on:click={settings_row_clicked}>ChatGPT prompts</td>
                            </tr>
                        </tbody>
                        </table>    

                        <table class="table w-full mt-16">
                        <thead>
                            <tr>
                            <th class="sticky top-0">General settings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="hover">
                                <td data-setting-id="3" class="cursor-pointer {selected_setting == 3 ? 'bg-tilbot-primary-200' : ''}" on:click={settings_row_clicked}>ChatGPT integration</td>
                            </tr>
                        </tbody>
                        </table>          
                    </div>     
                </div>
                <div class="flex-1 px-4" style="width: calc(100% - 16rem)">
                    <!-- Appearance -->
                    {#if selected_setting == 0}
                    <div class="w-full text-xl text-center font-bold">Appearance</div>
                    <div class="p-8">
                        <table class="table w-full">
                            <thead>
                                <th colspan="2">Avatar</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="w-48">Show avatar</td>
                                    <td><input type="radio" name="radio-1" class="radio" bind:group="{copy.show_avatar}" value="yes" /></td>
                                </tr>
                                <tr>
                                    <td class="w-48">Hide avatar</td>
                                    <td><input type="radio" name="radio-1" class="radio" bind:group="{copy.show_avatar}" value="no" /></td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="table w-full mt-8">
                            <thead>
                                <th colspan="2">Name</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="w-48">Bot name:</td>
                                    <td><input type="text" bind:value="{copy.name}" class="input input-sm input-bordered w-48" /></td>
                                </tr>
                            </tbody>
                        </table>                        
                    </div>
                    {/if}

                    <!-- Typing behavior -->
                    {#if selected_setting == 1}
                    <div class="w-full text-xl text-center font-bold">Typing behavior</div>
                    <div class="p-8">
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

                    <!-- ChatGPT prompts -->
                    {#if selected_setting == 2}
                    <div class="h-full flex flex-col w-full">
                        <div class="w-full text-xl text-center font-bold">ChatGPT prompts</div>
                        <div class="p-8 flex-1 overflow-y-auto">

                            <table class="table w-full">
                                <thead>
                                    <th>Temperature</th>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span class="italic">A higher temperature means ChatGPT is given more freedom to formulate its replies, it will be more random and less deterministic.</span><br /><br />
                                            <input type="range" min="0.1" max="0.9" bind:value="{copy.temperature}" class="range w-1/2" step="0.1" /> <br/>
                                            {copy.temperature}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>  

                            <table class="table w-full mt-6">
                                <thead>
                                    <th>Use of data or scenario</th>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span class="italic">(Optional) Add something here to instruct the bot to take certain contextual information into account, or pass variables/data to it.</span><br /><br />
                                            <textarea class="textarea textarea-bordered w-full" placeholder="[Characters]" bind:value="{copy.llm_prompt_data}"></textarea>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>                        

                            <table class="table w-full mt-8">
                                <thead>
                                    <th>Simulated user prompt</th>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span class="italic">It is <span class="font-bold">not</span> recommended to make any (major) changes to this prompt.</span><br /><br />
                                            <textarea class="textarea textarea-bordered w-full h-64" bind:value="{copy.llm_prompt}"></textarea>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>                        
                        </div>
                    </div>
                    {/if}

                    <!-- ChatGPT integration -->
                    {#if selected_setting == 3}
                    <div class="w-full text-xl text-center font-bold">ChatGPT Integration</div>
                    <div class="p-8">
                        <span class="italic">Note: These settings are stored on this device, and will not be included in the project file to avoid anyone using your ChatGPT API key and ramping up costs.</span><br /><br />
                        <table class="table w-full">
                            <thead>
                                <th>ChatGPT API key</th>
                            </thead>
                            <tbody>
                                    <input type="text" class="input input-bordered w-4/5 m-4" bind:value="{gen_copy.chatgpt_api_key}" />
                            </tbody>
                        </table>          
                        
                        <table class="table w-full mt-8">
                            <thead>
                                <th colspan="2">ChatGPT version for simulated user</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>3.5</td>
                                    <td><input type="radio" name="gpt-sim-version" class="radio" bind:group="{gen_copy.chatgpt_sim_version}" value="gpt-3.5-turbo" /></td>
                                </tr>
                                <tr>
                                    <td>4.0</td>
                                    <td><input type="radio" name="gpt-sim-version" class="radio" bind:group="{gen_copy.chatgpt_sim_version}" value="gpt-4" /></td>
                                </tr>
                            </tbody>
                        </table>                         
                    </div>
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
    import { onMount, createEventDispatcher } from "svelte";
    let toggle: HTMLElement;
    let selected_setting: number = 0;
    export let settings: any;
    export let gensettings: any;

    const dispatch = createEventDispatcher();

    let copy = {};
    let gen_copy = {};

    let default_prompt = `Act as a user of my chatbot. I will send you the output from the chatbot and then I would like you to provide responses that a user would create. 
    You should keep talking to the chatbot until you feel like you have reached your goal, or feel like the conversation is not progressing anymore.

    Whenever my messages contain curly brackets {}, the phrases between the curly brackets are the options for your output, separated by a semicolon ; . In this case, you can *only* reply with one of these options, no other text. 
    For example, if my message contains {Yes;No}, you can only reply with either Yes or No. Do not add any other words. 
    You cannot provide answer options with curly brackets for the chatbot.`;

    export const settingswindow = {
        show() {
            if (settings == undefined) {
                copy = {
                    'typing_style': 'fixed',
                    'typing_time': 2,
                    'typing_charpsec': 40,
                    'llm_prompt': default_prompt,
                    'llm_prompt_data': '',
                    'temperature': 0.5,
                    'show_avatar': 1,
                    'name': 'Tilbot'
                }
            }

            else {
                copy = JSON.parse(JSON.stringify(settings));

                // Defaults
                if (copy.typing_style == undefined) {
                    copy.typing_style = 'fixed';
                }
                if (copy.typing_time == undefined) {
                    copy.typing_time = 2;
                }
                if (copy.typing_charpsec == undefined) {
                    copy.typing_charpsec = 40;
                }
                if (copy.llm_prompt == undefined) {
                    copy.llm_prompt = default_prompt;
                }
                if (copy.llm_prompt_data == undefined) {
                    copy.llm_prompt_data = '';
                }
                if (copy.temperature == undefined) {
                    copy.temperature = 0.5;
                }
                if (copy.show_avatar == undefined) {
                    copy.show_avatar = 'yes';
                }
                if (copy.name == undefined) {
                    copy.name = 'Tilbot';
                }
            }

            gen_copy = JSON.parse(JSON.stringify(gensettings));

            toggle.click();
        }
    }

    function typing_style_change() {
        //copy.typing_style = event.currentTarget.value;
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
            settings: copy,
            gen_settings: gen_copy
        });

        reset();
        toggle.click();
    }

</script>