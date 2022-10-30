{#if loaded}
<div class="w-2/6">
    <img class="w-2/3" src="/images/tilbot_logo.svg" alt="Tilbot logo" />
</div>

<div>
    Welcome, {username}!
</div>

<div class="self-end" on:click="{logout}">
    Log out
</div>
{/if}

<script lang="ts">
    import { onMount } from 'svelte';

    let username = '';
    let loaded = false;

    // Load dashboard data
    onMount(async () => {
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
                    alert(txt);
                    loaded = true;
                }
                
            });
        })
        .catch(err => {
            console.log(err);
        });
    });

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
</script>