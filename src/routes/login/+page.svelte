<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col">
      <img class="w-2/3" src="/images/tilbot_logo.svg" alt="Tilbot logo" />

      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="alert alert-error shadow-lg" style="display: none">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Incorrect username or password.
          </div>
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
                <button type="submit" class="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</div>


<script lang="ts">
    function login(e) {
        const formData = new FormData(e.target);
        console.log(formData);

        const data: any = {};

        for (let field of formData) {
            const [key, value] = field;
            data[key] = value;
        }

        console.log(data);

        fetch("/api/login", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.log(err);
        });
    }
</script>


<!--<div id="dashboard_logo">
</div>

<div id="dashboard_header">
  Login
</div>

<div id="message_container">

  <div class="message_error_container" id="login_error">
    <div class="message_icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
    <div class="message_text">
      Incorrect username or password.
    </div>
  </div>

</div>

<div id="login_container">
  <div class="form_row">
    <div class="form_icon"><i class="fa-solid fa-user"></i></div>
    <div class="form_name">Name</div>
    <div class="form_field"><input id="txt_username" type="text" /></div>
  </div>
  <div class="form_row">
    <div class="form_icon"><i class="fa-solid fa-key"></i></div>
    <div class="form_name">Password</div>
    <div class="form_field"><input id="txt_pass" type="password" /></div>
  </div>

  <button type="button" id="btn_login">Log in</button>
</div>-->