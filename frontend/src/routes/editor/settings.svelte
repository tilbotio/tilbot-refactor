<script lang="ts">
  import { onMount } from "svelte";
  import type {
    GeneralSettings,
    ProjectSettings,
  } from "../../../../common/project/types";
  import { ArrowUpOnSquare, Trash } from "svelte-heros-v2";
  let window_api: any;

  let toggle = $state() as HTMLElement;
  let { projectSettings, settings, path, save: onSave } = $props();

  export function show() {
    toggle.click();
  }

  let is_loading_avatar: boolean = false;
  let is_loading_avatar_sm: boolean = false;

  const defaultPrompt = `Act as a user of my chatbot. I will send you the output from the chatbot and then I would like you to provide responses that a user would create.
  You should keep talking to the chatbot until you feel like you have reached your goal, or feel like the conversation is not progressing anymore.

  Whenever my messages contain curly brackets {}, the phrases between the curly brackets are the options for your output, separated by a semicolon ; . In this case, you can *only* reply with one of these options, no other text.
  For example, if my message contains {Yes;No}, you can only reply with either Yes or No. Do not add any other words.
  You cannot provide answer options with curly brackets for the chatbot.`;

  const defaultSettings: GeneralSettings = {
    llm_setting: "chatgpt",
    llm_api_address: "",
  };

  const defaultProjectSettings: ProjectSettings = {
    project_name: "New project",
    typing_style: "fixed",
    typing_time: 2,
    typing_charpsec: 40,
    llm_prompt: defaultPrompt,
    llm_prompt_data: "",
    temperature: 0.5,
    show_avatar: true,
    avatar_file: "",
    show_avatar_sm: false,
    avatar_file_sm: "",
    name: "Tilbot",
  };

  function copySettings(): GeneralSettings {
    return JSON.parse(
      JSON.stringify(Object.assign({}, defaultSettings, settings ?? {}))
    );
  }

  function copyProjectSettings(): ProjectSettings {
    return JSON.parse(
      JSON.stringify(
        Object.assign({}, defaultProjectSettings, projectSettings ?? {})
      )
    );
  }

  let settingsCopy: GeneralSettings = $state(copySettings());
  let projectSettingsCopy: ProjectSettings = $state(copyProjectSettings());

  $effect(() => {
    settingsCopy = copySettings();
  });

  $effect(() => {
    projectSettingsCopy = copyProjectSettings();
  });

  function firstletter(str: string): string {
    return str.charAt(0).toUpperCase();
  }

  onMount(() => {
    window_api = (window as any)?.api;

    // Only works in Electron for now. @TODO: implement for online version of Tilbot.
    if (
      typeof navigator === "object" &&
      typeof navigator.userAgent === "string" &&
      navigator.userAgent.indexOf("Electron") >= 0
    ) {
      window_api.receive("avatar-load", (param: any) => {
        if (is_loading_avatar) {
          projectSettingsCopy.avatar_file = param.filename;
          is_loading_avatar = false;
        } else if (is_loading_avatar_sm) {
          projectSettingsCopy.avatar_file_sm = param.filename;
          is_loading_avatar_sm = false;
        }
      });
    }
  });

  function load_avatar() {
    is_loading_avatar = true;
    window_api.send("do-load-avatar", projectSettingsCopy.avatar_file);
  }

  function delete_avatar() {
    if (projectSettingsCopy.avatar_file !== "") {
      window_api.send("do-delete-avatar", projectSettingsCopy.avatar_file);
      projectSettingsCopy.avatar_file = "";
    }
  }

  function load_avatar_sm() {
    is_loading_avatar_sm = true;
    window_api.send("do-load-avatar", projectSettingsCopy.avatar_file_sm);
  }

  function delete_avatar_sm() {
    if (projectSettingsCopy.avatar_file_sm !== "") {
      window_api.send("do-delete-avatar", projectSettingsCopy.avatar_file_sm);
      projectSettingsCopy.avatar_file_sm = "";
    }
  }

  function reset() {
    settingsCopy = copySettings();
    projectSettingsCopy = copyProjectSettings();
  }

  function cancel() {
    reset();
    toggle.click();
  }

  function save() {
    onSave(settingsCopy, projectSettingsCopy);
    toggle.click();
  }
</script>

<input
  type="checkbox"
  id="my-modal-settings"
  class="modal-toggle"
  bind:this={toggle}
/>
<div class="modal">
  <div class="modal-box relative w-11/12 max-w-full h-5/6 max-h-full">
    <label
      for="my-modal-settings"
      class="btn btn-sm btn-circle absolute right-2 top-2">✕</label
    >
    <div class="flex w-full h-full flex-col">
      <div class="flex w-full" style="height: calc(100% - 6rem)">
        <!-- List of settings -->
        <div class="overflow-x-auto">
          <div class="tabs tabs-lift">
            <input
              type="radio"
              name="settings-tabs"
              class="tab"
              aria-label="Information"
            />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <div class="w-full text-xl text-center font-bold">
                Information
              </div>
              <div class="p-8">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th>Project name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        ><input
                          type="text"
                          bind:value={projectSettingsCopy.project_name}
                          class="input input-sm input-bordered w-96"
                        />
                        {projectSettingsCopy.project_name}</td
                      >
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <input
              type="radio"
              name="settings-tabs"
              class="tab"
              aria-label="Appearance"
            />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <div class="w-full text-xl text-center font-bold">Appearance</div>
              <div class="p-8">
                <table class="table w-full">
                  <thead>
                    <tr><th colspan="2">Avatar</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="w-48">Show avatar</td>
                      <td
                        ><input
                          type="radio"
                          name="radio-1"
                          class="radio"
                          bind:group={projectSettingsCopy.show_avatar}
                          value="yes"
                        /></td
                      >
                    </tr>
                    <tr>
                      <td class="w-48">Hide avatar</td>
                      <td
                        ><input
                          type="radio"
                          name="radio-1"
                          class="radio"
                          bind:group={projectSettingsCopy.show_avatar}
                          value="no"
                        /></td
                      >
                    </tr>
                    {#if projectSettingsCopy.show_avatar}
                      <tr>
                        <td class="w-48">Avatar</td>
                        <td>
                          <div
                            class="avatar online placeholder mt-4 ml-4 w-12 float-left"
                          >
                            {#if projectSettingsCopy.avatar_file == ""}
                              <div
                                class="bg-neutral-focus text-neutral-content rounded-full w-12"
                              >
                                <span
                                  >{firstletter(projectSettingsCopy.name)}</span
                                >
                              </div>
                            {:else}
                              <div class="rounded-full w-12">
                                <img
                                  src={path + projectSettingsCopy.avatar_file}
                                  alt="Avatar"
                                />
                              </div>
                            {/if}
                          </div>
                          <button
                            class="btn-sm btn-square ml-4 mt-6"
                            onclick={load_avatar}><ArrowUpOnSquare /></button
                          >
                          <button
                            class="btn-sm btn-square mt-6"
                            onclick={delete_avatar}><Trash /></button
                          >
                        </td>
                      </tr>
                    {/if}
                    <tr>
                      <td class="w-48">Show small avatar next to messages</td>
                      <td
                        ><input
                          type="radio"
                          name="radio-2"
                          class="radio"
                          bind:group={projectSettingsCopy.show_avatar_sm}
                          value="yes"
                        /></td
                      >
                    </tr>
                    <tr>
                      <td class="w-48">Hide small avatar next to messages</td>
                      <td
                        ><input
                          type="radio"
                          name="radio-2"
                          class="radio"
                          bind:group={projectSettingsCopy.show_avatar_sm}
                          value="no"
                        /></td
                      >
                    </tr>
                    {#if projectSettingsCopy.show_avatar_sm}
                      <tr>
                        <td class="w-48">Small avatar</td>
                        <td>
                          <div class="float-left">
                            <div class="chat chat-start">
                              {#if projectSettingsCopy.avatar_file_sm == ""}
                                <div class="chat-image avatar">
                                  <div
                                    class="bg-neutral-focus text-neutral-content rounded-full w-10 !flex items-center justify-center"
                                  >
                                    <div>
                                      {firstletter(projectSettingsCopy.name)}
                                    </div>
                                  </div>
                                </div>
                              {:else}
                                <div class="chat-image avatar">
                                  <div class="w-10 rounded-full">
                                    <img
                                      src={path +
                                        projectSettingsCopy.avatar_file_sm}
                                      alt="Avatar"
                                    />
                                  </div>
                                </div>
                              {/if}
                              <div
                                class="chat-bubble bg-tilbot-secondary-purple pr-16"
                              >
                                Hello there!
                              </div>
                            </div>
                          </div>
                          <button
                            class="btn-sm btn-square ml-4 mt-6"
                            onclick={load_avatar_sm}><ArrowUpOnSquare /></button
                          >
                          <button
                            class="btn-sm btn-square mt-6"
                            onclick={delete_avatar_sm}><Trash /></button
                          >
                        </td>
                      </tr>
                    {/if}
                  </tbody>
                </table>

                <table class="table w-full mt-8">
                  <thead>
                    <tr><th colspan="2">Name</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="w-48">Bot name:</td>
                      <td
                        ><input
                          type="text"
                          bind:value={projectSettingsCopy.name}
                          class="input input-sm input-bordered w-48"
                        /></td
                      >
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <input
              type="radio"
              name="settings-tabs"
              class="tab"
              aria-label="Typing behavior"
            />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <div class="w-full text-xl text-center font-bold">
                Typing behavior
              </div>
              <div class="p-8">
                <table class="table w-full">
                  <thead>
                    <tr
                      ><th colspan="2"
                        >Typing speed ({projectSettingsCopy.typing_style})</th
                      ></tr
                    >
                  </thead>
                  <tbody>
                    <tr>
                      <td>Variable typing speed (based on text length)</td>
                      <td
                        ><input
                          type="radio"
                          name="typing-style"
                          class="radio"
                          bind:group={projectSettingsCopy.typing_style}
                          value="variable"
                        /></td
                      >
                    </tr>
                    {#if projectSettingsCopy.typing_style == "variable"}
                      <tr>
                        <td>&nbsp;&nbsp;&nbsp;&nbsp;Characters typed per sec</td
                        >
                        <td
                          ><input
                            type="number"
                            bind:value={projectSettingsCopy.typing_charpsec}
                            min="1"
                            class="input input-sm input-bordered w-24"
                          /></td
                        >
                      </tr>
                    {/if}
                    <tr>
                      <td>Fixed typing speed</td>
                      <td
                        ><input
                          type="radio"
                          name="typing-style"
                          class="radio"
                          bind:group={projectSettingsCopy.typing_style}
                          value="fixed"
                        /></td
                      >
                    </tr>
                    {#if projectSettingsCopy.typing_style == "fixed"}
                      <tr>
                        <td>&nbsp;&nbsp;&nbsp;&nbsp;Time spent typing (sec)</td>
                        <td
                          ><input
                            type="number"
                            bind:value={projectSettingsCopy.typing_time}
                            min="1"
                            class="input input-sm input-bordered w-24"
                          /></td
                        >
                      </tr>
                    {/if}
                  </tbody>
                </table>
              </div>
            </div>
            <input
              type="radio"
              name="settings-tabs"
              class="tab"
              aria-label="ChatGPT prompts"
            />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <div class="h-full flex flex-col w-full">
                <div class="w-full text-xl text-center font-bold">
                  ChatGPT prompts
                </div>
                <div class="p-8 flex-1 overflow-y-auto">
                  <table class="table w-full">
                    <thead>
                      <tr><th>Temperature</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span class="italic"
                            >A higher temperature means ChatGPT is given more
                            freedom to formulate its replies, it will be more
                            random and less deterministic.</span
                          ><br /><br />
                          <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            bind:value={projectSettingsCopy.temperature}
                            class="range w-1/2"
                            step="0.1"
                          /> <br />
                          {projectSettingsCopy.temperature}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="table w-full mt-6">
                    <thead>
                      <tr><th>Use of data or scenario</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span class="italic"
                            >(Optional) Add something here to instruct the bot
                            to take certain contextual information into account,
                            or pass variables/data to it.</span
                          ><br /><br />
                          <textarea
                            class="textarea textarea-bordered w-full"
                            placeholder="[Characters]"
                            bind:value={projectSettingsCopy.llm_prompt_data}
                          ></textarea>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="table w-full mt-8">
                    <thead>
                      <tr><th>Simulated user prompt</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span class="italic"
                            >It is <span class="font-bold">not</span> recommended
                            to make any (major) changes to this prompt.</span
                          ><br /><br />
                          <textarea
                            class="textarea textarea-bordered w-full h-64"
                            bind:value={projectSettingsCopy.llm_prompt}
                          ></textarea>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <input
              type="radio"
              name="settings-tabs"
              class="tab"
              aria-label="General settings"
            />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <div class="w-full text-xl text-center font-bold">
                Large Language Model Integration
              </div>
              <div class="p-8">
                <table class="table w-full">
                  <thead>
                    <tr><th colspan="2">Choice of large language model</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Other LLM API (e.g., Llama)</td>
                      <td
                        ><input
                          type="radio"
                          name="llm-setting"
                          class="radio"
                          bind:group={settingsCopy.llm_setting}
                          value="llama"
                        /></td
                      >
                    </tr>
                    <tr>
                      <td>ChatGPT</td>
                      <td
                        ><input
                          type="radio"
                          name="llm-setting"
                          class="radio"
                          bind:group={settingsCopy.llm_setting}
                          value="chatgpt"
                        /></td
                      >
                    </tr>
                  </tbody>
                </table>

                <br /><br />

                {#if settingsCopy.llm_setting == "chatgpt"}
                  <span class="italic"
                    >Note: These settings are stored on this device, and will
                    not be included in the project file to avoid anyone using
                    your ChatGPT API key and ramping up costs.</span
                  ><br /><br />
                  <table class="table w-full">
                    <thead>
                      <tr><th>ChatGPT API key</th></tr>
                    </thead>
                    <tbody>
                      <tr
                        ><td
                          ><input
                            type="text"
                            class="input input-bordered w-4/5 m-4"
                            bind:value={settingsCopy.chatgpt_api_key}
                          /></td
                        ></tr
                      >
                    </tbody>
                  </table>

                  <table class="table w-full mt-8">
                    <thead>
                      <tr
                        ><th colspan="2">ChatGPT version for simulated user</th
                        ></tr
                      >
                    </thead>
                    <tbody>
                      <tr>
                        <td>3.5</td>
                        <td
                          ><input
                            type="radio"
                            name="gpt-sim-version"
                            class="radio"
                            bind:group={settingsCopy.chatgpt_sim_version}
                            value="gpt-3.5-turbo"
                          /></td
                        >
                      </tr>
                      <tr>
                        <td>4.0</td>
                        <td
                          ><input
                            type="radio"
                            name="gpt-sim-version"
                            class="radio"
                            bind:group={settingsCopy.chatgpt_sim_version}
                            value="gpt-4-1106-preview"
                          /></td
                        >
                      </tr>
                    </tbody>
                  </table>
                {:else}
                  <table class="table w-full">
                    <thead>
                      <tr><th>API address</th></tr>
                    </thead>
                    <tbody>
                      <tr
                        ><td
                          ><input
                            type="text"
                            class="input input-bordered w-4/5 m-4"
                            bind:value={settingsCopy.llm_api_address}
                          /></td
                        ></tr
                      >
                    </tbody>
                  </table>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-24 text-right">
        <div class="divider"></div>
        <button class="btn btn-active" onclick={save}>Save</button
        >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button
          class="btn btn-outline"
          onclick={cancel}>Cancel</button
        >
      </div>
    </div>
  </div>
</div>
