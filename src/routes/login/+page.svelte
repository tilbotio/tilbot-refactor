<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col">
      <img class="w-72" src="/images/tilbot_logo.svg" alt="Tilbot logo" />
      <div class="card flex-shrink-0 w-full w-96 shadow-2xl bg-base-100">
        <div class="card-body">
          <form on:submit|preventDefault={login}>
            <div class="form-control">
                <label class="label">
                <span class="label-text">Name</span>
                </label>
                <input name="username" id="txt_username" type="text" placeholder="name" class="input input-bordered" />
            </div>
            <div class="form-control">
                <label class="label">
                <span class="label-text">Password</span>
                </label>
                <input name="password" id="txt_pass" type="password" placeholder="password" class="input input-bordered" />
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
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error_txt}</span>
        </div>
        {/if}
        {#if info}
        <div class="alert alert-info shadow-lg justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{info_txt}</span>
        </div>
        {/if}
      </div>

    </div>
</div>


<script lang="ts">
    import { onMount } from "svelte";

    let error = false;
    let error_txt = '';
    let info = false;
    let info_txt = '';

    onMount(() => {
      // Check if an admin account exists, if not create one.
      fetch(location.protocol + '//' + window.location.hostname + "/api/admin_account_exists", {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            response.text().then(txt => {
              if (txt == 'CREATED') {
                info_txt = 'No admin account was found, so I created it. Log in with username "admin", password "admin"';
                info = true;
              }
            });            
        })
        .catch(err => {
            error_txt = 'Unknown error occurred. Please contact your administrator and try again later.';
            error = true;
        });      
    });

    function login(e: any) {
        error = false;
        info = false;

        const formData = new FormData(e.target);

        const data: any = {};

        for (let field of formData) {
            const [key, value] = field;
            data[key] = value;
        }

        fetch(location.protocol + '//' + window.location.hostname + "/api/login", {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            response.text().then(txt => {
              if (txt == 'OK') {
                window.location.replace('/dashboard');

              }
              else {
                error_txt = 'Incorrect username or password.';
                error = true;
              }
            });            
        })
        .catch(err => {
            error_txt = 'Unknown error occurred. Please contact your administrator and try again later.';
            error = true;
            console.log(err);
        });
    }
</script>