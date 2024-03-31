<input type="checkbox" id="my-modal-settings" class="modal-toggle" bind:this={toggle} />
<div class="modal">
    <div class="modal-box relative w-11/12 max-w-full h-5/6 max-h-full">
        <label for="my-modal-settings" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <div class="w-full" style="height: calc(100% - 7rem)">
            <div class="w-full text-xl text-center font-bold">Add new user</div>
            <div class="p-8">
                <table class="table w-full">
                    <tbody>
                        <tr>
                            <td>Username</td>
                            <td><input type="text" class="input input-bordered" bind:value="{user.username}" /></td>
                        </tr>
                        <tr>
                            <td>Password</td>
                            <td><input type="password" class="input input-bordered" bind:value="{user.password}" /></td>
                        </tr>
                    </tbody>
                </table>
                {#if error !== ''}
                <div class="alert alert-error shadow-lg justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>      
                {/if}
            </div>                
        </div>
        <div class="h-24 text-right">
            <div class="divider"></div> 
            <button class="btn btn-active" on:click={save}>Save</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="btn btn-outline" on:click={cancel}>Cancel</button>
        </div>
    </div>
</div>

<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();    

    let toggle: HTMLElement;
    let error: string = '';

    let user = {};

    export const newuserwindow = {
        show() {
            user = {};
            toggle.click();
        }
    }

    function cancel() {
        toggle.click();
    }

    function save() {
        fetch(location.protocol + '//' + window.location.hostname + '/api/create_user_account', {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)            
        })
        .then(response => {
            response.text().then(txt => {
                if (txt == 'OK') {
                    dispatch('message', {
                        event: 'load_data'
                    });           
                    toggle.click();
                }
                else if (txt == 'NOT_LOGGED_IN') {
                    location.replace('/login');                    
                }
                else if (txt == 'USER_EXISTS') {
                    error = 'A user with that username already exists.';
                }
                else {
                    error = txt;
                }
                
            });
        })
        .catch(err => {
            error = 'An unknown error occurred. Please contact your administrator.'
            console.log(err);
        });
    }

</script>