<script lang="ts">
  import { onMount } from "svelte";
  import { InformationCircle, XCircle } from "svelte-heros-v2";

  let error: string | null = $state(null);
  let info: string | null = $state(null);

  onMount(async () => {
    // Check if an admin account exists, if not create one.
    try {
      const response = await fetch("/api/admin_account_exists");
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      if (text === "CREATED") {
        info =
          'No admin account was found, so I created it. Log in with username "admin", password "admin"';
      }
    } catch (err) {
      console.log(err);
      error =
        "Unknown error occurred. Please contact your administrator and try again later.";
    }
  });

  async function login(e: Event) {
    e.preventDefault();

    error = null;
    info = null;

    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));

    try {
      const response = await fetch("/api/login", {
        method: "post",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }
      if (text === "OK") {
        window.location.replace("/dashboard");
      } else {
        error = "Incorrect username or password.";
        console.log(text);
      }
    } catch (err) {
      error =
        "Unknown error occurred. Please contact your administrator and try again later.";
      console.log(err);
    }
  }
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col">
    <img class="w-72" src="/images/tilbot_logo.svg" alt="Tilbot logo" />
    <div class="card flex-shrink-0 w-full w-96 shadow-2xl bg-base-100">
      <div class="card-body">
        <form onsubmit={login}>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Name</span>
              <input
                name="username"
                id="txt_username"
                type="text"
                placeholder="name"
                class="input input-bordered"
              />
            </label>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
              <input
                name="password"
                id="txt_pass"
                type="password"
                placeholder="password"
                class="input input-bordered"
              />
            </label>
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn">Login</button>
          </div>
        </form>
      </div>
    </div>

    <div class="h-14">
      {#if error}
        <div class="alert alert-error shadow-lg justify-start">
          <XCircle class="flex-shrink-0 h-6 w-6" />
          <span>{error}</span>
        </div>
      {/if}
      {#if info}
        <div class="alert alert-info shadow-lg justify-start">
          <InformationCircle class="shrink-0 w-6 h-6" />
          <span>{info}</span>
        </div>
      {/if}
    </div>
  </div>
</div>
