<script lang="ts">
  import { onMount } from "svelte";
  import {
    defaultGeneralSettings,
    defaultProjectSettings,
    type GeneralSettings,
    type ProjectSettings,
  } from "../../../../common/project/types";
  import { ArrowUpOnSquare, Plus, Trash } from "svelte-heros-v2";

  let windowApi: any;

  let toggle = $state() as HTMLElement;
  let { projectSettings, settings, path, save: onSave } = $props();

  export function show() {
    toggle.click();
  }

  function copyGeneralSettings(): GeneralSettings {
    return JSON.parse(
      JSON.stringify(Object.assign({}, defaultGeneralSettings, settings ?? {}))
    );
  }

  function copyProjectSettings(): ProjectSettings {
    return JSON.parse(
      JSON.stringify(
        Object.assign({}, defaultProjectSettings, projectSettings ?? {})
      )
    );
  }

  function addExternalLink(): void {
    projectSettingsCopy.external_links.push({
      name: "",
      url: "",
      url_editor: null,
      send_user_input: true,
      send_connectors: false,
    });
  }

  let generalSettingsCopy: GeneralSettings = $state(copyGeneralSettings());
  let projectSettingsCopy: ProjectSettings = $state(copyProjectSettings());

  $effect(() => {
    generalSettingsCopy = copyGeneralSettings();
  });

  $effect(() => {
    projectSettingsCopy = copyProjectSettings();
  });

  function firstletter(str: string): string {
    return str.charAt(0).toUpperCase();
  }

  onMount(() => {
    windowApi = (window as any)?.api;
  });

  async function load_avatar() {
    const newAvatar = await windowApi.invoke(
      "load-avatar",
      projectSettingsCopy.avatar_file
    );
    if (newAvatar) {
      projectSettingsCopy.avatar_file = newAvatar;
    }
  }

  function delete_avatar() {
    if (projectSettingsCopy.avatar_file !== "") {
      windowApi.send("do-delete-avatar", projectSettingsCopy.avatar_file);
      projectSettingsCopy.avatar_file = "";
    }
  }

  async function load_avatar_sm() {
    const newAvatar = await windowApi.invoke(
      "load-avatar",
      projectSettingsCopy.avatar_file_sm
    );
    if (newAvatar) {
      projectSettingsCopy.avatar_file_sm = newAvatar;
    }
  }

  function delete_avatar_sm() {
    if (projectSettingsCopy.avatar_file_sm !== "") {
      windowApi.send("do-delete-avatar", projectSettingsCopy.avatar_file_sm);
      projectSettingsCopy.avatar_file_sm = "";
    }
  }

  function reset() {
    generalSettingsCopy = copyGeneralSettings();
    projectSettingsCopy = copyProjectSettings();
  }

  function cancel() {
    reset();
    toggle.click();
  }

  function save() {
    onSave(generalSettingsCopy, projectSettingsCopy);
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
              checked
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
                                  src="{path}/{projectSettingsCopy.avatar_file}"
                                  alt="Avatar"
                                />
                              </div>
                            {/if}
                          </div>
                          <button
                            class="btn-sm btn-square ml-4 mt-6"
                            onclick={load_avatar}
                            ><ArrowUpOnSquare class="w-6 h-6" /></button
                          >
                          <button
                            class="btn-sm btn-square mt-6"
                            onclick={delete_avatar}
                            ><Trash class="w-6 h-6" /></button
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
                                      src="{path}/{projectSettingsCopy.avatar_file_sm}"
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
                            onclick={load_avatar_sm}
                            ><ArrowUpOnSquare class="w-6 h-6" /></button
                          >
                          <button
                            class="btn-sm btn-square mt-6"
                            onclick={delete_avatar_sm}
                            ><Trash class="w-6 h-6" /></button
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
              aria-label="External processing"
            />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <div class="w-full text-xl text-center font-bold">
                Links for external processing
              </div>
              <div class="p-8">
                Below you can add links to external systems, for example for
                more elaborate intent recognition or (LLM-based) processing.<br
                />
                See the Tilbot repository on Github for examples of such processing
                systems. These can be used in "Processing" blocks (with the sparkle
                icon).

                {#each projectSettingsCopy.external_links.entries() as [id, external_link] (id)}
                  <hr class="mt-8" />
                  <table class="table w-full">
                    <tbody>
                      <tr>
                        <td>
                          Name for this external system, can be used throughout
                          Tilbot to refer to it:
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="ChatGPT interface"
                            class="input input-bordered w-full max-w-xs"
                            bind:value={external_link.name}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td> Address where the external system is running: </td>
                        <td>
                          <input
                            type="text"
                            placeholder="chatgpt:8081"
                            class="input input-bordered w-full max-w-xs"
                            bind:value={external_link.url}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          (Optional) If the above address is not accessible by
                          the stand-alone version of Tilbot, please enter an
                          alternative address here:
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="localhost:8081"
                            class="input input-bordered w-full max-w-xs"
                            bind:value={external_link.url_editor}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <label class="label cursor-pointer">
                            <span class="label-text"
                              >Send the user's input (response to previous
                              block) to the external system</span
                            >
                            <input
                              type="checkbox"
                              class="toggle"
                              bind:checked={external_link.send_user_input}
                            />
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <label class="label cursor-pointer">
                            <span class="label-text"
                              >Send the connectors of the processing block to
                              the external system</span
                            >
                            <input
                              type="checkbox"
                              class="toggle"
                              bind:checked={external_link.send_connectors}
                            />
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td> </td><td>
                          <button
                            class="btn btn-square btn-outline btn-sm"
                            onclick={() => {
                              projectSettingsCopy.external_links.splice(id, 1);
                            }}><Trash class="w-6 h-6" /></button
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                {/each}
                <br /><br />
                <button class="btn gap-2" onclick={addExternalLink}>
                  <Plus class="w-6 h-6" />
                </button>
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
