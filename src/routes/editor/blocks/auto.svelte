<div class="card w-64 bg-slate-100 shadow-lg indicator" id="block_{blockId}">
    <span class="indicator-item indicator-middle indicator-start badge slate-800 z-0"></span>
    <div class="card-body p-4">
        <div class="flex">
            <h2 class="card-title text-base grow">
                {objAttributes.name}
            </h2>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>                   
            </div>     
        </div>  
        <div class="text-sm h-16 line-clamp-3">{@html objAttributes.content}</div>
        {#each Object.entries(objAttributes.connectors) as [id, connector]}
            <div class="divider m-0"></div>
            Yo
            {#each Object.entries(connector.targets) as [idt, target]}
                target {target} {blockId}
            {/each}
        {/each}
        
    </div>
</div>

<script type="ts">
    export let objAttributes = {};
    export let blockId = {};
</script>