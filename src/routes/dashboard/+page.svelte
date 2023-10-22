<NewUser bind:newuserwindow={newuser_window} on:message={handleNewUserMessage}></NewUser>
{#if loaded}
<div>
    <div class="w-1/4 h-24 float-left">
        <img class="w-48 mt-2" src="/images/tilbot_logo.svg" alt="Tilbot logo" />
    </div>

    <div class="h-24 mt-6 float-left text-lg">
        Welcome, {data.username}!
    </div>

    <div class="h-24 mt-4 mr-6 float-right">
        <button class="btn gap-2" on:click="{logout}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 float-left">
                <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clip-rule="evenodd" />
            </svg>       
            Log out
        </button>
    </div>
</div>

<div class="flex flex-col gap-y-4 justify-center w-screen overflow-y-auto">
    <div class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 float-left mt-1 mr-4">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
            
        Your account
        </div>
        <div class="collapse-content flex flex-col items-center"> 

            <div class="text-lg mb-4">Change your password</div>

            {#if pass_error}
            <div class="alert alert-error shadow-lg justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {pass_error_txt}
            </div>
            {/if}     
            
            {#if pass_success}
            <div class="alert alert-success shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Your password has been updated!</span>
                </div>
            </div>
            {/if}            

            <form class="w-1/4" on:submit|preventDefault={update_pass}>
                <div class="form-control mb-6">
                    <label class="label">
                    <span class="label-text">Old password</span>
                    </label>
                    <input name="oldpass" id="txt_old_pass" type="password" placeholder="Old password" class="input input-bordered" />
                </div>
                <div class="form-control">
                    <label class="label">
                    <span class="label-text">New password</span>
                    </label>
                    <input name="newpass" id="txt_new_pass" type="password" placeholder="New password" class="input input-bordered" />
                </div>
                <div class="form-control">
                    <label class="label">
                    <span class="label-text">New password (again, just to be sure)</span>
                    </label>
                    <input name="newpass2" id="txt_new_pass2" type="password" placeholder="New password (again)" class="input input-bordered" />
                </div>
                <div class="form-control mt-6">
                    <button type="submit" class="btn bg-tilbot-primary-400 hover:bg-tilbot-primary-500">Update password</button>
                </div>

              </form>

        </div>
    </div>

    {#if data.users}
    <div class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" bind:this={toggle_users} />
        <div class="collapse-title text-xl font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 float-left mt-1 mr-4">
                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
              </svg>
                        
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
                        <td><input type="checkbox" class="toggle" data-username="{u.username}" bind:checked={u.active} on:change={set_user_active}/></td>
                      </tr>
                    {/each}                   
                  </tbody>                 
                </table>

                <div class="mt-6 w-full text-center">
                    <button type="submit" class="btn w-60 bg-tilbot-primary-400 hover:bg-tilbot-primary-500" on:click={newuser_window.show()}>+ Add new user</button>
                </div>                
              </div>            
        </div>
    </div>  
    {/if}
    
    {#if data.projects}
    <div class="w-11/12 self-center collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" bind:this={toggle_projects} />
        <div class="collapse-title text-xl font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 float-left mt-1 mr-4">
                <path fill-rule="evenodd" d="M4.606 12.97a.75.75 0 01-.134 1.051 2.494 2.494 0 00-.93 2.437 2.494 2.494 0 002.437-.93.75.75 0 111.186.918 3.995 3.995 0 01-4.482 1.332.75.75 0 01-.461-.461 3.994 3.994 0 011.332-4.482.75.75 0 011.052.134z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M5.752 12A13.07 13.07 0 008 14.248v4.002c0 .414.336.75.75.75a5 5 0 004.797-6.414 12.984 12.984 0 005.45-10.848.75.75 0 00-.735-.735 12.984 12.984 0 00-10.849 5.45A5 5 0 001 11.25c.001.414.337.75.751.75h4.002zM13 9a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
                          
        Projects
        </div>
        <div class="collapse-content"> 
            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                  <!-- head -->
                  <thead>
                    <tr>
                      <th>Project name</th>
                      <th>Running</th>
                      <th>View</th>
                      <th>Logs</th>
                      <th>Edit</th>
                      <th>Delete</th>
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
                        <td><input type="checkbox" class="toggle" data-id="{p.id}" bind:checked={p.status} on:change={toggle_project_running}/></td>
                        <td></td>
                        <td></td>
                        <td>
                            <a href="/editor?project={p.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                                </svg>                                  
                            </a>
                        </td>
                        <td></td>
                      </tr>
                    {/each}                   
                  </tbody>                 
                </table>

                <div class="mt-6 w-full text-center">
                    <button type="submit" class="btn w-60 bg-tilbot-primary-400 hover:bg-tilbot-primary-500" on:click={new_project}>+ New project</button>
                </div>                
              </div>        
        </div>
    </div>    
    {/if}
</div>

{/if}

<script lang="ts">
import NewUser from './newuser.svelte';
import { SvelteComponent, onMount } from 'svelte';

    let data = {};
    let loaded = false;
    let pass_error = false;
    let pass_error_txt = '';
    let pass_success = false;

    let newuser_window: SvelteComponent;
    let toggle_users: HTMLInputElement;
    let toggle_projects: HTMLInputElement;

    // Load dashboard data
    onMount(async () => {
        load_data();
    });

    function load_data() {
        fetch(location.protocol + '//' + window.location.hostname + ':3001/api/get_dashboard', {
            method: 'get',
            credentials: 'include'
        })
        .then(response => {
            response.text().then(txt => {
                if (txt == 'NOT_LOGGED_IN') {
                    location.replace('/login');                    
                }
                else {
                    let json = JSON.parse(txt);
                    data = json;
                    console.log(json);
                    loaded = true;


                    setTimeout(function() {
                        if (data.users !== undefined && !toggle_users.checked) {
                            toggle_users.click();
                        }
                        else if (data.projects !== undefined && !toggle_projects.checked) {
                            toggle_projects.click();
                        }
                    }, 20);

                }
                
            });
        })
        .catch(err => {
            console.log(err);
        });        
    }

    function logout(e: any) {
        fetch(location.protocol + '//' + window.location.hostname + ":3001/api/logout", {
            method: 'post',
            credentials: 'include'
        })
        .then(response => {
            response.text().then(txt => {
                // Always succeeds
                location.replace('/login');
            });            
        })
        .catch(err => {
            console.log(err);
        });        
    }

    function update_pass(e: any) {
        pass_error = false;

        const formData = new FormData(e.target);

        const data: any = {};

        for (let field of formData) {
            const [key, value] = field;
            data[key] = value;
        }

        if (data['newpass'] != data['newpass2']) {
            pass_error_txt = 'The two new passwords do not match.';
            pass_error = true;
        }

        else {

            fetch(location.protocol + '//' + window.location.hostname + ":3001/api/change_pass", {
                method: 'post',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                response.text().then(txt => {
                    if (txt == 'true') {
                        pass_success = true;
                    }
                    else {
                        pass_error_txt = 'Error changing password: did you enter the correct old password?';
                        pass_error = true;
                    }
                });            
            })
            .catch(err => {
                pass_error_txt = 'Unknown error occurred. Please contact your administrator and try again later.';
                pass_error = true;
                console.log(err);
            });      
             
        }
    }

    function set_user_active(e: any) {
        fetch(location.protocol + '//' + window.location.hostname + ":3001/api/set_user_active", {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                active: e.target.checked,
                username: e.target.dataset['username']
            })
        })
        .then(response => {
            response.text().then(txt => {
                console.log(txt);
            });            
        })
        .catch(err => {
            console.log(err);
        });            
    }

    function handleNewUserMessage(e: Event) {
        if (e.detail.event == 'load_data') {
            load_data();
        }
    }

    function new_project() {
        fetch(location.protocol + '//' + window.location.hostname + ":3001/api/create_project", {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            response.text().then(txt => {
                if (txt == 'OK') {
                    alert('project created!');
                }
                else {

                }
            });            
        })
        .catch(err => {
            console.log(err);
        });         
    }

    function toggle_project_running() {
        // @TODO
    }

</script>