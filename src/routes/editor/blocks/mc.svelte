<div class="card w-64 bg-slate-100 shadow-lg indicator">
    <span class="indicator-item indicator-middle indicator-start badge slate-800 z-0"></span>
    <div class="card-body p-4">
        <div class="flex">
            <h2 class="card-title text-base grow">
                {objAttributes.name}
            </h2>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>                                    
            </div>     
        </div>  
        <div class="text-sm h-16 line-clamp-3">{@html objAttributes.content}</div>
        <div class="divider m-0"></div>
    </div>
</div>

<script type="ts">
    export let objAttributes = {};
</script>