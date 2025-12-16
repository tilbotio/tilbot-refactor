<script lang="ts">
  import { onMount } from "svelte";
  import { InformationCircle, XCircle } from "svelte-heros-v2";

  let error = $state(false);
  let error_txt = $state("");
  let info = $state(false);
  let info_txt = $state("");

  onMount(async () => {
    // Check if an admin account exists, if not create one.
    try {
      const response = await fetch("/api/admin_account_exists");
      const txt = await response.text();
      if (txt == "CREATED") {
        info_txt =
          'No admin account was found, so I created it. Log in with username "admin", password "admin"';
        info = true;
      }
    } catch (err) {
      error_txt =
        "Unknown error occurred. Please contact your administrator and try again later.";
      error = true;
    }
  });

  async function login(e: any) {
    e.preventDefault();

    error = false;
    info = false;

    const formData = new FormData(e.target);

    const data: any = {};

    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    try {
      const response = await fetch("/api/login", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const txt = await response.text();
      if (!response.ok) {
        throw new Error(txt);
      }
      if (txt == "OK") {
        window.location.replace("/dashboard");
      } else {
        error_txt = "Incorrect username or password.";
        error = true;
      }
    } catch (err) {
      error_txt =
        "Unknown error occurred. Please contact your administrator and try again later.";
      error = true;
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
          <span>{error_txt}</span>
        </div>
      {/if}
      {#if info}
        <div class="alert alert-info shadow-lg justify-start">
          <InformationCircle class="shrink-0 w-6 h-6" />
          <span>{info_txt}</span>
        </div>
      {/if}
    </div>
  </div>
</div>
