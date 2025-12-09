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
  let pass_error = $state(false);
  let pass_error_txt = $state("");
  let pass_success = $state(false);

  let settings_error = $state(false);
  let settings_error_txt = $state("");
  let settings_success = $state(false);

  let newuser_window = $state() as NewUser;
  let toggle_users = $state() as HTMLInputElement;
  let toggle_projects = $state() as HTMLInputElement;
  let toggle_settings = $state() as HTMLInputElement;
  let import_file_upload = $state() as HTMLInputElement;
  let import_file = $state() as FileList;
  let selected_project_id = $state() as string;

  $effect(() => {
    if (import_file && import_file[0]) {
      let data = new FormData();
      data.append("file", import_file[0], import_file[0].name);
      data.append("project_id", selected_project_id);
      const fetch_init = {
        method: "post",
        credentials: "include" as RequestCredentials,
        body: data,
      };

      async function background_fetch() {
        try {
          const response = await fetch("/api/import_project", fetch_init);
          const txt = await response.text();
          if (txt == "NOT_LOGGED_IN") {
            location.replace("/login");
          } else {
            load_data();
          }
        } catch (err) {
          console.log(err);
        }
      }

      background_fetch();
    }
  });

  // Load dashboard data
  onMount(load_data);

  function view_bot(id: string) {
    window.open(`/?project=${id}`, "_blank");
  }

  async function get_logs(id: string) {
    try {
      const response = await fetch(`api/get_logs?projectid=${id}`, {
        method: "get",
        credentials: "include",
      });
      const txt = await response.text();
      const dataStr =
        "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
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

  async function load_data() {
    try {
      const response = await fetch("/api/get_dashboard", {
        method: "get",
        credentials: "include",
      });
      const txt = await response.text();
      if (txt == "NOT_LOGGED_IN") {
        location.replace("/login");
      } else {
        data = JSON.parse(txt);
        // console.log(json);
        loaded = true;

        setTimeout(function () {
          if (data.users !== undefined && !toggle_users.checked) {
            toggle_users.click();
          } else if (data.projects !== undefined && !toggle_projects.checked) {
            toggle_projects.click();
          }
        }, 20);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function logout(e: any) {
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

  async function update_pass(e: any) {
    e.preventDefault();

    pass_error = false;
    // FIXME: maybe initialize pass_success too?

    const formData = new FormData(e.target);

    const data: any = {};

    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    if (data["newpass"] != data["newpass2"]) {
      pass_error_txt = "The two new passwords do not match.";
      pass_error = true;
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
        const txt = await response.text();
        if (txt === "true") {
          pass_success = true;
        } else {
          pass_error_txt =
            "Error changing password: did you enter the correct old password?";
          pass_error = true;
        }
      } catch (err) {
        pass_error_txt =
          "Unknown error occurred. Please contact your administrator and try again later.";
        pass_error = true;
        console.log(err);
      }
    }
  }

  async function set_user_active(e: any) {
    try {
      const response = await fetch("/api/set_user_active", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: e.target.checked,
          username: e.target.dataset["username"],
        }),
      });
      const txt = await response.text();
      console.log(txt);
    } catch (err) {
      console.log(err);
    }
  }

  async function new_project() {
    try {
      const response = await fetch("/api/create_project", {
        method: "post",
        credentials: "include",
      });
      const txt = await response.text();
      if (txt == "OK") {
        load_data();
      }
    } catch (err) {
      console.log(err);
    }
  }

  function set_project_inactive(e: any) {
    async function _do_set_project_inactive() {
      try {
        const response = await fetch("/api/set_project_active", {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: false,
            projectid: e.target.dataset["id"],
          }),
        });
        const txt = await response.text();
        console.log(txt);
        load_data();
      } catch (err) {
        console.log(err);
      }
    }

    // confirm() is reactive and therefore can't be inside an async context
    if (
      confirm(
        `Are you sure you wish to delete the project "${e.target.dataset["name"]}?`
      )
    ) {
      _do_set_project_inactive();
    }
  }

  function import_project(e: any) {
    selected_project_id = e.target.dataset["id"];
    import_file_upload.click();
  }

  async function toggle_project_running(e: any) {
    try {
      const response = await fetch("/api/set_project_status", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectid: e.target.dataset["id"],
          status: e.target.dataset["status"] == "true" ? 1 : 0,
        }),
      });
      const txt = await response.text();
      console.log(txt);
    } catch (err) {
      console.log(err);
    }
  }

  async function save_settings() {
    settings_error = false;
    settings_success = false;

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
      const txt = await response.text();
      console.log(txt);
      load_data();
      settings_success = true;
    } catch (err) {
      settings_error_txt =
        "An unknown error occurred, please contact your administrator.";
      settings_error = true;
      console.log(err);
    }
  }
</script>

<NewUser bind:this={newuser_window} onUserCreated={load_data} />
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

        {#if pass_error}
          <div class="alert alert-error shadow-lg justify-start">
            <XCircle class="flex-shrink-0 h-6 w-6" />
            {pass_error_txt}
          </div>
        {/if}

        {#if pass_success}
          <div class="alert alert-success shadow-lg">
            <div>
              <CheckCircle class="flex-shrink-0 h-6 w-6" />
              <span>Your password has been updated!</span>
            </div>
          </div>
        {/if}

        <form class="w-1/4" onsubmit={update_pass}>
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
        <input type="checkbox" bind:this={toggle_users} />
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
                        onchange={set_user_active}
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
                onclick={() => { newuser_window.show() }}>+ Add new user</button
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
        <input type="checkbox" bind:this={toggle_projects} />
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
                          if (p.status) view_bot(p.id);
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
                        onchange={toggle_project_running}
                      />
                    </td>
                    <td class="text-center">
                      <ArrowDownTray
                        onclick={import_project}
                        data-id={p.id}
                        class="w-6 h-6 inline-block cursor-pointer"
                      />
                    </td>
                    <td class="text-center">
                      <DocumentArrowDown
                        onclick={() => {
                          get_logs(p.id);
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
                        onclick={set_project_inactive}
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
                onclick={new_project}>+ New project</button
              >
            </div>
          </div>
        </div>
      </div>

      <input
        accept=".tilbot"
        bind:this={import_file_upload}
        bind:files={import_file}
        type="file"
        name="projectfile"
        class="hidden"
      />
    {/if}

    {#if data.settings}
      <div
        class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <input type="checkbox" bind:this={toggle_settings} />
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

            {#if settings_error}
              <div class="mt-4 alert alert-error shadow-lg justify-start">
                <XCircle class="stroke-current flex-shrink-0 h-6 w-6" />
                {settings_error_txt}
              </div>
            {/if}

            {#if settings_success}
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
                onclick={save_settings}>Save settings</button
              >
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
