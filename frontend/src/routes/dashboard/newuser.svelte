<script lang="ts">
  import { XCircle } from "svelte-heros-v2";

  const { onUserCreated } = $props();

  let toggle = $state() as HTMLElement;
  let error: string | null = $state(null);

  let user: any = $state({});

  export function show() {
    user = {};
    toggle.click();
  }

  function cancel() {
    toggle.click();
  }

  async function save() {
    try {
      error = null;
      const response = await fetch("/api/create_user_account", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      if (text === "OK") {
        onUserCreated();
        toggle.click();
      } else if (text === "NOT_LOGGED_IN") {
        location.replace("/login");
      } else if (text === "USER_EXISTS") {
        error = "A user with that username already exists.";
      } else {
        error = text;
      }
    } catch (err) {
      error = "An unknown error occurred. Please contact your administrator.";
      console.log(err);
    }
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
    <div class="w-full" style="height: calc(100% - 7rem)">
      <div class="w-full text-xl text-center font-bold">Add new user</div>
      <div class="p-8">
        <table class="table w-full">
          <tbody>
            <tr>
              <td>Username</td>
              <td
                ><input
                  type="text"
                  class="input input-bordered"
                  bind:value={user.username}
                /></td
              >
            </tr>
            <tr>
              <td>Password</td>
              <td
                ><input
                  type="password"
                  class="input input-bordered"
                  bind:value={user.password}
                /></td
              >
            </tr>
          </tbody>
        </table>
        {#if error}
          <div class="alert alert-error shadow-lg justify-start">
            <XCircle class="flex-shrink-0 h-6 w-6" />
            {error}
          </div>
        {/if}
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
