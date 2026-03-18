<script lang="ts">
  import { onMount } from "svelte";
  import {
    ArrowDownTray,
    ArrowLeftEndOnRectangle,
    CheckCircle,
    Cog6Tooth,
    DocumentArrowDown,
    GlobeAlt,
    User,
    Users,
    RocketLaunch,
    Trash,
    XCircle,
  } from "svelte-heros-v2";
  import NewUser from "./newuser.svelte";

  let data: any = $state({});
  let loaded = $state(false);
  let passwordChangeError: string | null = $state(null);
  let passwordChangeSuccess = $state(false);

  let settingsSaveError: string | null = $state(null);
  let settingsSaveSuccess = $state(false);

  let newuserWindow = $state() as NewUser;
  let usersToggle = $state() as HTMLInputElement;
  let projectsToggle = $state() as HTMLInputElement;
  let settingsToggle = $state() as HTMLInputElement;
  let importFileUpload = $state() as HTMLInputElement;
  let importFile = $state() as FileList;
  let selectedProjectId = $state() as string;

  $effect(() => {
    if (importFile && importFile[0]) {
      const data = new FormData();
      data.append("file", importFile[0], importFile[0].name);
      data.append("project_id", selectedProjectId);
      const fetchInit = {
        method: "post",
        credentials: "include" as RequestCredentials,
        body: data,
      };

      (async () => {
        try {
          const response = await fetch("/api/import_project", fetchInit);
          const text = await response.text();
          if (text === "NOT_LOGGED_IN") {
            location.replace("/login");
          } else {
            loadData();
          }
        } catch (err) {
          console.log(err);
        }
      })();
    }
  });

  // Load dashboard data
  onMount(loadData);

  function viewBot(id: string) {
    window.open(`/?project=${id}`, "_blank");
  }

  async function getLogs(id: string) {
    try {
      const response = await fetch(`api/get_logs?projectid=${id}`, {
        method: "get",
        credentials: "include",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      const dataStr =
        "data:text/plain;charset=utf-8," + encodeURIComponent(text);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "logs.csv");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      console.log(err);
    }
  }

  async function loadData() {
    try {
      const response = await fetch("/api/get_dashboard", {
        method: "get",
        credentials: "include",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      if (text === "NOT_LOGGED_IN") {
        location.replace("/login");
      } else {
        data = JSON.parse(text);
        loaded = true;

        setTimeout(function () {
          if (data.users !== undefined && !usersToggle.checked) {
            usersToggle.click();
          } else if (data.projects !== undefined && !projectsToggle.checked) {
            projectsToggle.click();
          }
        }, 20);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function logout(e: MouseEvent) {
    try {
      const response = await fetch("/api/logout", {
        method: "post",
        credentials: "include",
      });
      await response.text();
      // Always succeeds
      location.replace("/login");
    } catch (err) {
      console.log(err);
    }
  }

  async function updatePassword(e: SubmitEvent) {
    e.preventDefault();

    passwordChangeError = null;
    passwordChangeSuccess = false;

    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));

    if (data.newpass != data.newpass2) {
      passwordChangeError = "The two new passwords do not match.";
    } else {
      try {
        const response = await fetch("/api/change_pass", {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const text = await response.text();
        if (text === "true") {
          passwordChangeSuccess = true;
        } else {
          passwordChangeError =
            "Error changing password: did you enter the correct old password?";
        }
      } catch (err) {
        passwordChangeError =
          "Unknown error occurred. Please contact your administrator and try again later.";
        console.log(err);
      }
    }
  }

  async function setUserActive(e: Event) {
    try {
      const target = e.target as HTMLInputElement;
      const response = await fetch("/api/set_user_active", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: target.checked,
          username: target.dataset.username,
        }),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      console.log(text);
    } catch (err) {
      console.log(err);
    }
  }

  async function newProject() {
    try {
      const response = await fetch("/api/create_project", {
        method: "post",
        credentials: "include",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      if (text === "OK") {
        loadData();
      }
    } catch (err) {
      console.log(err);
    }
  }

  function setProjectInactive(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const dataset = target.dataset;
    // confirm() is reactive and therefore can't be inside an async context
    if (
      confirm(`Are you sure you wish to delete the project "${dataset.name}?`)
    ) {
      (async () => {
        try {
          const response = await fetch("/api/set_project_active", {
            method: "post",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              active: false,
              projectid: dataset.id,
            }),
          });
          const text = await response.text();
          if (!response.ok) {
            throw new Error(text);
          }
          console.log(text);
          loadData();
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }

  function importProject(e: Event) {
    const target = e.target as HTMLElement;
    selectedProjectId = target.dataset.id!;
    importFileUpload.click();
  }

  async function toggleProjectRunning(e: Event) {
    try {
      const target = e.target as HTMLElement;
      const dataset = target.dataset;
      const response = await fetch("/api/set_project_status", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectid: dataset.id,
          status: dataset.status === "true" ? 1 : 0,
        }),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      console.log(text);
    } catch (err) {
      console.log(err);
    }
  }

  async function saveSettings() {
    settingsSaveError = null;
    settingsSaveSuccess = false;

    try {
      const response = await fetch("/api/save_settings", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: JSON.stringify(data.settings),
        }),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      console.log(text);
      loadData();
      settingsSaveSuccess = true;
    } catch (err) {
      settingsSaveError =
        "An unknown error occurred, please contact your administrator.";
      console.log(err);
    }
  }
</script>

<NewUser bind:this={newuserWindow} onUserCreated={loadData} />
{#if loaded}
  <div>
    <div class="w-1/4 h-24 float-left">
      <img
        class="w-48 mt-4 ml-8"
        src="/images/tilbot_logo.svg"
        alt="Tilbot logo"
      />
    </div>

    <div class="h-24 mt-8 float-left text-lg">
      Welcome, {data.username}!
    </div>

    <div class="h-24 mt-6 mr-12 float-right">
      <button class="btn gap-2" onclick={logout}>
        <ArrowLeftEndOnRectangle class="w-5 h-5 float-left" />
        Log out
      </button>
    </div>
  </div>

  <div class="flex flex-col gap-y-4 justify-center w-screen overflow-y-auto">
    <div
      class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
    >
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium">
        <User class="w-5 h-5 float-left mt-1 mr-4" />
        Your account
      </div>
      <div class="collapse-content flex flex-col items-center">
        <div class="text-lg mb-4">Change your password</div>

        {#if passwordChangeError}
          <div class="alert alert-error shadow-lg justify-start">
            <XCircle class="flex-shrink-0 h-6 w-6" />
            {passwordChangeError}
          </div>
        {/if}

        {#if passwordChangeSuccess}
          <div class="alert alert-success shadow-lg">
            <div>
              <CheckCircle class="flex-shrink-0 h-6 w-6" />
              <span>Your password has been updated!</span>
            </div>
          </div>
        {/if}

        <form class="w-1/4" onsubmit={updatePassword}>
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">Old password</span>
              <input
                name="oldpass"
                id="txt_old_pass"
                type="password"
                placeholder="Old password"
                class="input input-bordered"
              />
            </label>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">New password</span>
              <input
                name="newpass"
                id="txt_new_pass"
                type="password"
                placeholder="New password"
                class="input input-bordered"
              />
            </label>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text"
                >New password (again, just to be sure)</span
              >
              <input
                name="newpass2"
                id="txt_new_pass2"
                type="password"
                placeholder="New password (again)"
                class="input input-bordered"
              />
            </label>
          </div>
          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn bg-tilbot-primary-400 hover:bg-tilbot-primary-500"
              >Update password</button
            >
          </div>
        </form>
      </div>
    </div>

    {#if data.users}
      <div
        class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <input type="checkbox" bind:this={usersToggle} />
        <div class="collapse-title text-xl font-medium">
          <Users class="w-5 h-5 float-left mt-1 mr-4" />
          Users
        </div>
        <div class="collapse-content">
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <!-- head -->
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Running projects</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {#each data.users as u, index}
                  <tr>
                    <th>{u.username}</th>
                    <td>{u.running_projects}</td>
                    <td
                      ><input
                        type="checkbox"
                        class="toggle"
                        data-username={u.username}
                        bind:checked={u.active}
                        onchange={setUserActive}
                      /></td
                    >
                  </tr>
                {/each}
              </tbody>
            </table>

            <div class="mt-6 w-full text-center">
              <button
                type="submit"
                class="btn w-60 bg-tilbot-primary-400 hover:bg-tilbot-primary-500"
                onclick={() => {
                  newuserWindow.show();
                }}>+ Add new user</button
              >
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.projects}
      <div
        class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <input type="checkbox" bind:this={projectsToggle} />
        <div class="collapse-title text-xl font-medium">
          <RocketLaunch class="w-5 h-5 float-left mt-1 mr-4" />
          Projects
        </div>
        <div class="collapse-content">
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <!-- head -->
              <thead>
                <tr>
                  <th>Project name</th>
                  <th class="text-center">View</th>
                  <th class="text-center">Running</th>
                  <th class="text-center">Import</th>
                  <th class="text-center">Logs</th>
                  <!--<th>Edit</th>-->
                  <th class="text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {#if data.projects.length == 0}
                  <tr>
                    <td colspan="6" class="text-center">No projects yet.</td>
                  </tr>
                {/if}

                {#each data.projects as p, index}
                  <tr>
                    <th>{p.name}</th>
                    <td class="text-center">
                      <GlobeAlt
                        onclick={() => {
                          if (p.status) viewBot(p.id);
                        }}
                        color={p.status ? "currentColor" : "#e8e8e8"}
                        class="w-6 h-6 inline-block {p.status
                          ? 'cursor-pointer'
                          : 'disabled'}"
                      />
                    </td>
                    <td class="text-center">
                      <input
                        type="checkbox"
                        class="toggle"
                        data-id={p.id}
                        data-status={p.status}
                        bind:checked={p.status}
                        onchange={toggleProjectRunning}
                      />
                    </td>
                    <td class="text-center">
                      <ArrowDownTray
                        onclick={importProject}
                        data-id={p.id}
                        class="w-6 h-6 inline-block cursor-pointer"
                      />
                    </td>
                    <td class="text-center">
                      <DocumentArrowDown
                        onclick={() => {
                          getLogs(p.id);
                        }}
                        class="w-6 h-6 inline-block cursor-pointer"
                      />
                    </td>
                    <!-- <td>
                            <a href="/editor?project={p.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                                </svg>
                            </a>
                        </td> -->
                    <td class="text-center">
                      <Trash
                        onclick={setProjectInactive}
                        data-id={p.id}
                        data-name={p.name}
                        class="w-6 h-6 inline-block cursor-pointer"
                      />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>

            <div class="mt-6 w-full text-center">
              <button
                type="submit"
                class="btn w-60 bg-tilbot-primary-400 hover:bg-tilbot-primary-500"
                onclick={newProject}>+ New project</button
              >
            </div>
          </div>
        </div>
      </div>

      <input
        accept=".tilbot"
        bind:this={importFileUpload}
        bind:files={importFile}
        type="file"
        name="projectfile"
        class="hidden"
      />
    {/if}

    {#if data.settings}
      <div
        class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <input type="checkbox" bind:this={settingsToggle} />
        <div class="collapse-title text-xl font-medium">
          <Cog6Tooth class="w-6 h-6 float-left mt-1 mr-4" />
          Settings
        </div>
        <div class="collapse-content">
          <div class="overflow-x-auto">
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
                      bind:group={data.settings.llm_setting}
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
                      bind:group={data.settings.llm_setting}
                      value="chatgpt"
                    /></td
                  >
                </tr>
              </tbody>
            </table>

            <br /><br />

            {#if data.settings.llm_setting == "chatgpt"}
              <table class="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>ChatGPT API key</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    ><td
                      ><input
                        type="text"
                        class="input input-bordered w-4/5 m-4"
                        bind:value={data.settings.chatgpt_api_key}
                      /></td
                    ></tr
                  >
                </tbody>
              </table>

              <table class="table w-full mt-8">
                <thead>
                  <tr>
                    <th colspan="2">ChatGPT version</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>3.5</td>
                    <td
                      ><input
                        type="radio"
                        name="gpt-version"
                        class="radio"
                        bind:group={data.settings.chatgpt_version}
                        value="3.5"
                      /></td
                    >
                  </tr>
                  <tr>
                    <td>4.0</td>
                    <td
                      ><input
                        type="radio"
                        name="gpt-version"
                        class="radio"
                        bind:group={data.settings.chatgpt_version}
                        value="4.0"
                      /></td
                    >
                  </tr>
                </tbody>
              </table>
            {:else}
              <table class="table w-full">
                <thead>
                  <tr><th>Large language model API address</th></tr>
                </thead>
                <tbody>
                  <tr
                    ><td
                      ><input
                        type="text"
                        class="input input-bordered w-4/5 m-4"
                        bind:value={data.settings.llm_api_address}
                      /></td
                    ></tr
                  >
                </tbody>
              </table>
            {/if}

            {#if settingsSaveError}
              <div class="mt-4 alert alert-error shadow-lg justify-start">
                <XCircle class="stroke-current flex-shrink-0 h-6 w-6" />
                {settingsSaveError}
              </div>
            {/if}

            {#if settingsSaveSuccess}
              <div class="mt-4 alert alert-success shadow-lg">
                <div>
                  <CheckCircle class="stroke-current flex-shrink-0 h-6 w-6" />
                  <span>Your settings have been saved!</span>
                </div>
              </div>
            {/if}

            <div class="mt-6 w-full text-center">
              <button
                type="submit"
                class="btn w-60 bg-tilbot-primary-400 hover:bg-tilbot-primary-500"
                onclick={saveSettings}>Save settings</button
              >
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
