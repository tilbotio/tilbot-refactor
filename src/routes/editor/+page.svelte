<div id="editor" class="overflow-hidden">
    <!--<a href="/dashboard">-->
        <img src="images/tilbot_logo.svg" class="ml-1 mt-2 w-48" />
    <!--</a>-->

    <Variables bind:variablewindow={variables_window} variables={project.variables}></Variables>
    <Settings bind:settingswindow={settings_window} settings={project.settings} gensettings={gen_settings} on:message={handleSettingsMessage}></Settings>

    <input type="checkbox" bind:this={modal_edit} class="modal-toggle" />
    <div class="modal">
    <div class="modal-box relative max-w-4xl">
        {#if edit_block !== null}
        <svelte:component this={block_popup_components[edit_block.type]} objAttributes={edit_block} on:message={handleEditBlockMessage} />
        {/if}
    </div>
    </div>    


    <input type="checkbox" bind:this={modal_launch} class="modal-toggle" />
    <div class="modal">
    <div class="modal-box relative">
        <h3 class="text-lg font-bold">

            <svg style="display: inline; vertical-align: sub" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>

            Project running as server
        </h3>
        <div class="divider"></div> 
        <p class="py-4">Connect devices on the same network to: {local_ip}:2801</p>
        <p class="py-4">Or via the internet: {public_ip}:2801<br />
        <span class="text-sm">(make sure your router is set up to forward port 2801)</span></p>
        <br />
        <div class="divider"></div> 
        <p><button class="btn btn-active" on:click={btn_close_server_click}>Close server</button></p>
    </div>
    </div>    


    <div id="menu" class="fixed float-left z-10 mt-4">
        <ul class="menu bg-base-100 p-2 rounded-box bg-slate-200 ml-2 mt-2 shadow-md">
            <li>
            <a class="active:bg-tilbot-secondary-hardpink">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </a>
            <ul class="bg-slate-100">
                <div class="tooltip tooltip-right" data-tip="Automatically proceed">
                <li>
                    <a class="active:bg-tilbot-secondary-hardpink" on:click={() => new_block('Auto')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>                          
                    </a>
                </li>
                </div>
                <!--<div class="tooltip tooltip-right" data-tip="List">
                <li>
                    <a>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                        </svg>

                    </a>
                </li>
                </div>-->
                <div class="tooltip tooltip-right" data-tip="Multiple choice">
                <li>
                    <a class="active:bg-tilbot-secondary-hardpink" on:click={() => new_block('MC')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>                          
                    </a>
                </li>
                </div>
                <!--<div class="tooltip tooltip-right" data-tip="Python">
                <li>
                    <a>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                          </svg>
                    </a>
                </li>
                </div>-->                  
                <div class="tooltip tooltip-right" data-tip="Text">
                <li>
                    <a class="active:bg-tilbot-secondary-hardpink" on:click={() => new_block('Text')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                        </svg>
                    </a>
                </li>
                </div>                
            </ul>
            </li>
            <div class="tooltip tooltip-right" data-tip="Add trigger">
                <li>
                <a class="active:bg-tilbot-secondary-hardpink" on:click={() => new_block('Trigger')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                    </svg>
                </a>
                </li>
            </div>
              
            <!--<div class="tooltip tooltip-right" data-tip="Add group">
                <li>
                <a>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                    </svg>
                </a>
                </li>
            </div>-->
            <li>
                
                &nbsp;<br /><br />
            
            </li>            
            <div class="tooltip tooltip-right" data-tip="Variables & data">
                <li>
                <a class="active:bg-tilbot-secondary-hardpink" on:click="{btn_variables_click}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.745 3A23.933 23.933 0 003 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 011.105.402l2.402 7.206a.75.75 0 001.104.401l1.445-.889m-8.25.75l.213.09a1.687 1.687 0 002.062-.617l4.45-6.676a1.688 1.688 0 012.062-.618l.213.09" />
                      </svg>
                </a>
                </li>
            </div>              
            <div class="tooltip tooltip-right" data-tip="Settings">
                <li>
                <a class="active:bg-tilbot-secondary-hardpink" on:click="{btn_settings_click}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>                      
                </a>
                </li>
            </div>
            {#if is_electron}
            <div class="tooltip tooltip-right" data-tip="Launch project">
                <li>
                <a class="active:bg-tilbot-secondary-hardpink" on:click="{btn_launch_click}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                </a>
                </li>
            </div>         
            {/if}  
            
            <li>
                
                &nbsp;<br /><br />
            
            </li>  
        
            <div class="tooltip tooltip-right" data-tip="Load project">
                <li>
                <a class="active:bg-tilbot-secondary-hardpink" on:click={btn_load_click}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                    </svg>                      
                </a>
                </li>
            </div>    
            <div class="tooltip tooltip-right" data-tip="Save project">
                <li>
                <a class="active:bg-tilbot-secondary-hardpink" on:click={btn_save_click}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>                                         
                </a>
                </li>
            </div>                                
        </ul>
    </div>

    <div id="alert" class="flex justify-center w-full absolute top-4 invisible">
        <div class="alert alert-success shadow-lg w-[250px]">
            <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span id="alert_text">Project saved!</span>
            </div>
        </div>    
    </div>

    <div class="flex flex-row w-screen h-screen absolute top-0 z-0">
        <div id="editor_main" class="grow overflow-auto" style="max-width: calc(100vw - 24rem)" on:click={editor_clicked} on:mousedown={editor_mousedown} on:mousemove={editor_mousemove} on:mouseup={editor_mouseup}>
            <div class="relative" style="width: {project.canvas_width + 'px'}; height: {project.canvas_height + 'px'}">
                <svg style="width: {project.canvas_width + 'px'}; height: {project.canvas_height + 'px'}" class="absolute pointer-events-none z-40">
                    {#if Object.entries(line_locations).length > 1}
                        {#each Object.entries(project.blocks) as [id, block]}
                            {#each Object.entries(block.connectors) as [cid, connector]}
                                {#each connector.targets as target}
                                    <path d="{
                                        'M' + line_locations[id].connectors[cid].x + ',' + line_locations[id].connectors[cid].y +
                                        ' L' + (Math.abs(line_locations[target].x - line_locations[id].connectors[cid].x) * 0.05 + line_locations[id].connectors[cid].x) + 
                                        ',' + line_locations[id].connectors[cid].y + 
                                        ' C' + (line_locations[id].connectors[cid].x + Math.abs(line_locations[target].x - line_locations[id].connectors[cid].x) * 0.5) +
                                        ',' + line_locations[id].connectors[cid].y +
                                        ' ' + (line_locations[target].x - Math.abs(line_locations[target].x - line_locations[id].connectors[cid].x) * 0.5) + 
                                        ',' + line_locations[target].y + 
                                        ' ' + (- Math.abs(line_locations[target].x - line_locations[id].connectors[cid].x) * 0.05 + line_locations[target].x) + 
                                        ',' + line_locations[target].y +
                                        ' L' + line_locations[target].x + ',' + line_locations[target].y
                                    }" 
                                    stroke-width="2" 
                                    fill="none" 
                                    data-from-block="{id}" 
                                    data-from-connector="{cid}" 
                                    data-to-block="{target}" 
                                    on:click={line_clicked} 
                                    class="pointer-events-auto stroke-tilbot-primary-300">

                                    </path>
                                {/each}
                            {/each}
                        {/each}

                        {#if project.starting_block_id !== -1}
                        <path d="{
                            'M' + line_locations['-1'].connectors[0].x + ',' + line_locations['-1'].connectors[0].y +
                            ' L' + (Math.abs(line_locations[project.starting_block_id.toString()].x - line_locations['-1'].connectors[0].x) * 0.05 + line_locations['-1'].connectors[0].x) + 
                            ',' + line_locations['-1'].connectors[0].y + 
                            ' C' + (line_locations['-1'].connectors[0].x + Math.abs(line_locations[project.starting_block_id.toString()].x - line_locations['-1'].connectors[0].x) * 0.5) +
                            ',' + line_locations['-1'].connectors[0].y +
                            ' ' + (line_locations[project.starting_block_id.toString()].x - Math.abs(line_locations[project.starting_block_id.toString()].x - line_locations['-1'].connectors[0].x) * 0.5) + 
                            ',' + line_locations[project.starting_block_id.toString()].y + 
                            ' ' + (- Math.abs(line_locations[project.starting_block_id.toString()].x - line_locations['-1'].connectors[0].x) * 0.05 + line_locations[project.starting_block_id.toString()].x) + 
                            ',' + line_locations[project.starting_block_id.toString()].y +
                            ' L' + line_locations[project.starting_block_id.toString()].x + ',' + line_locations[project.starting_block_id.toString()].y
                        }" 
                        stroke-width="2" 
                        fill="none" 
                        data-from-block="-1"  
                        data-to-block="{project.starting_block_id}" 
                        on:click={line_clicked} 
                        class="pointer-events-auto stroke-tilbot-primary-300">
    
                        </path>                    
                        {/if}                        
                    {/if}

                    <!-- For creating new lines -->
                    {#if dragging_connector.block_id !== undefined}
                        <line class="z-50" x1="{line_locations[dragging_connector.block_id].connectors[dragging_connector.connector_id].x}" y1="{line_locations[dragging_connector.block_id].connectors[dragging_connector.connector_id].y}" x2="{dragging_connector.mouseX}" y2="{dragging_connector.mouseY}" stroke="black" stroke-width="2" />
                    {/if}
                </svg>

                <div id="btn_del_line" class="absolute invisible">
                    <button class="btn btn-xs btn-circle bg-tilbot-secondary-hardpink border-tilbot-secondary-hardpink hover:bg-white hover:text-tilbot-secondary-hardpink hover:border-tilbot-secondary-hardpink" on:click={delete_selected_line}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                </div>

                <Start bind:el={start}></Start>

                {#if project.blocks !== undefined}
                    {#each Object.entries(project.blocks) as [id, block]}
                        <Draggable objAttributes={block} on:message={handleDraggableMessage} id={id}>
                            <svelte:component this={block_components[block.type]} blockId={id} selectedId={selected_id} objAttributes={block} on:message={handleBlockMessage} />
                        </Draggable>
                    {/each}
                {/if}
            </div>
        </div>
    
        <div class="flex flex-col w-full max-w-sm pr-1.5 pl-1.5 bottom-0">
            <div id="simulator_menu" class="w-full mr-1.5 mt-2 text-center">
                <button class="btn gap-2" on:click={run_all}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>         
                    Run all
                </button> 
    
                <!--<button class="btn gap-2 {selected_id === 0 ? 'btn-disabled' : ''}" on:click={run_selected}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                    </svg>          
                    From selected
                </button>-->

                <ChatGPT is_running={chatgpt_running} settings={project.settings} gensettings={gen_settings} variables={project.variables} on:message={handleChatGPTMessage}></ChatGPT>
            </div>
    
            <div id="simulator" class="mockup-phone w-full my-1.5 h-full">
                <div class="camera"></div>
                <div class="display h-full w-full">
                    <div class="artboard artboard-demo h-full">
                        <iframe src="/" class="w-full h-full" bind:this={simulator}>
    
                        </iframe>
                    </div>
                    
                </div>
            </div>

            <!--<div class="card shadow-md bg-tilbot-primary-200 w-84 fixed grid place-items-center bottom-2 left-2">
                <div class="card-body p-4">
                  <h2 class="card-title text-sm text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                    </svg>
                      
                    ThronoCrigger — Tilbot song
                </h2>
                  <p class="text-sm text-center text-white">02:00 <progress class="progress w-56 progress-accent" value="40" max="100"></progress> 05:00 <br />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="inline w-6 h-6 mt-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg> 
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="inline w-5 h-5 stroke-accent mt-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      
                  </p>
                </div>
            </div>-->

        </div>
    </div>    
</div>


<!-- Hidden file field to be able to load files -->
<input name="upload" type="file" class="invisible" bind:this={jsonfileinput} on:change={import_project_file} />


<script lang="ts">
    import { onMount, SvelteComponent } from "svelte";   
    import { page } from '$app/stores'; 
    import Variables from './variables.svelte';
    import Settings from './settings.svelte';
    import ChatGPT from './chatgpt.svelte';
    import Draggable from './draggable.svelte';
    import Start from './start.svelte';
    import AutoBlock from './blocks/auto.svelte';
    import MCBlock from './blocks/mc.svelte';
    import TextBlock from './blocks/text.svelte';
    import TriggerBlock from './blocks/trigger.svelte';
    import AutoBlockPopup from './block_popups/auto.svelte';
    import MCBlockPopup from './block_popups/mc.svelte';
    import TextBlockPopup from './block_popups/text.svelte';
    import TriggerBlockPopup from './block_popups/trigger.svelte';

    let block_components: {[key: string]: any} = {
        'Auto': AutoBlock,
        'MC': MCBlock,
        'Text': TextBlock,
        'Trigger': TriggerBlock
    };

    let block_popup_components: {[key: string]: any} = {
        'Auto': AutoBlockPopup,
        'MC': MCBlockPopup,
        'Text': TextBlockPopup,
        'Trigger': TriggerBlockPopup
    }

    let jsonfileinput: HTMLElement;
    let simulator: HTMLIFrameElement;
    let start: SvelteComponent;
    let variables_window: SvelteComponent;
    let settings_window: SvelteComponent;

    let project: any = {
        'name': 'New project',
        'current_block_id': 1,
        'blocks': {},
        'starting_block_id': -1,
        'canvas_width': 2240,
        'canvas_height': 1480,
        'bot_name': 'Tilbot',
        'avatar_image': '/client/img/default_profile.svg',
        'variables': [],
        'settings': {}
    };
    let modal_launch: HTMLInputElement;
    let modal_edit: HTMLInputElement;

    let selected_id = 0;
    let edit_block = null;

    // I think the only way to have accurate and up-to-date lines is to create a sort of look-up table.
    let line_locations = {};

    let num_draggable_loaded = 0;
    let is_loading = false;

    let is_electron: boolean = false;
    let local_ip = '';
    let public_ip = '';

    // For creating lines
    let dragging_connector = {};

    let gen_settings = {};
    let chatgpt_running = false;

    onMount(() => {
        // Set a property on the window so that the simulator knows it's part of the editor.
        window.isTilbotEditor = true;
        
        add_start_location();

        // Hack to fix the simulator in Electron (specifically on OS X)
        if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
            is_electron = true;
            simulator.src = 'index.html';

            window.api.receive('server-ip', (data: any) => {
                public_ip = data.public_ip;
                local_ip = data.local_ip;
            });

            window.api.receive('project-load', (project_str: string) => {
                load_project(project_str);
            });


            window.api.receive('project-saved', () => {
                document.getElementById('alert_text').textContent = 'Project saved!';
                document.getElementById('alert')?.classList.remove('invisible');

                setTimeout(function() {
                    document.getElementById('alert')?.classList.add('invisible');
                }, 3000);
            });   

            window.api.receive('settings-load', (param: any) => {
                gen_settings = param.settings;
            });

            window.api.send('get-settings');
        }

        if (!is_electron) {
            const url = $page.url;
            console.log(url.searchParams.get('project'));
        }

        project.canvas_width = screen.width * 1.5;
        project.canvas_height = screen.height * 1.5;
    });
    
    function add_start_location() {
        let r = start.getBoundingClientRect();
        line_locations['-1'] = {
                            x: r.left + r.width / 2 + document.getElementById('editor_main').scrollLeft,
                            y: r.bottom + document.getElementById('editor_main').scrollTop,
                            connectors: [
                                {
                                    x: r.left + r.width / 2 + document.getElementById('editor_main').scrollLeft,
                                    y: r.bottom + document.getElementById('editor_main').scrollTop
                                }
                            ]
                        };        
    }

    function new_block(type: string) {
        // @TODO: take into account current level / groupblock
        project.blocks[project.current_block_id] = {
            type: type,
            name: 'Block ' + project.current_block_id,
            content: '',
            x: document.getElementById('editor_main').scrollLeft + screen.width * 0.35,
            y: document.getElementById('editor_main').scrollTop + screen.height * 0.4,
            connectors: []
        }

        if (type == 'Auto') {
            project.blocks[project.current_block_id].connectors = [
                {
                    type: "Basic",
                    targets: []
                }
            ]
        }

        else if (type == 'Text') {
            project.blocks[project.current_block_id].connectors = [
                {
                    type: "Labeled",
                    label: "[else]",
                    targets: []
                }
            ]
        }

        else if (type == 'Trigger') {
            project.blocks[project.current_block_id].name = 'Trigger ' + project.current_block_id;
        }
 
        project.current_block_id += 1;

        deselect_all();
        
        setTimeout(function() {
            selected_id = project.current_block_id-1;
        }, 50);
    }
    
    function btn_load_click() {
        window.api.send('do-load');
        //jsonfileinput.click(); // For web version
    }

    function btn_save_click() {
        window.api.send('do-save', JSON.stringify(project));
    }

    function btn_variables_click() {
        variables_window.show();
    }

    function btn_settings_click() {
        settings_window.show();
    }

    function btn_launch_click() {
        modal_launch.click();
        window.api.send('open-server', JSON.stringify(project));
    }

    function btn_close_server_click() {
        modal_launch.click();
        window.api.send('close-server');
    }

    function import_project_file(event: Event) {
        if (event.target !== null) {
            const tar = event.target as HTMLInputElement;

            if (tar.files !== null && tar.files[0] !== undefined) {

                const reader = new FileReader();
                reader.onload = function(load_event) {
                    if (load_event.target !== null) {
                        const res = load_event.target.result as string;
                        load_project(res);        
                    }                    
                }

                reader.readAsText(tar.files[0]);                    
            }
        }
    }

    function handleDraggableMessage(e: Event) {
        if (e.detail.event == 'draggable_loaded') {
            if (is_loading) {            
                num_draggable_loaded += 1;

                if (num_draggable_loaded == Object.keys(project.blocks).length) {
                    is_loading = false;
                    // Build the look-up table for connecting lines.
                    for (const [key, value] of Object.entries(project.blocks)) {

                        let in_obj = document.getElementById('block_' + key + '_in').getBoundingClientRect();

                        line_locations[key] = {
                            x: in_obj.left + in_obj.width / 2 + document.getElementById('editor_main').scrollLeft,
                            y: in_obj.top + in_obj.height / 2 + document.getElementById('editor_main').scrollTop
                        };
                        
                        line_locations[key].connectors = {};

                        for (const cid in value.connectors) {
                            var con_obj = document.getElementById('block_' + key + '_c_' + cid).getBoundingClientRect();
                            line_locations[key].connectors[cid] = {
                                x: con_obj.left + con_obj.width / 2 + document.getElementById('editor_main').scrollLeft,
                                y: con_obj.top + con_obj.height / 2 + document.getElementById('editor_main').scrollTop
                            }
                        }
                    }
                }
            }
            else {
                // Just add the one new entry in the collection
                let block = project.blocks[e.detail.id];

                let in_obj = document.getElementById('block_' + e.detail.id + '_in').getBoundingClientRect();
                line_locations[e.detail.id] = {
                    x: in_obj.left + in_obj.width / 2 + document.getElementById('editor_main').scrollLeft,
                    y: in_obj.top + in_obj.height / 2 + document.getElementById('editor_main').scrollTop                    
                };

                line_locations[e.detail.id].connectors = {};

                for (const cid in block.connectors) {
                    var con_obj = document.getElementById('block_' + e.detail.id + '_c_' + cid).getBoundingClientRect();
                    line_locations[e.detail.id].connectors[cid] = {
                        x: con_obj.left + con_obj.width / 2 + document.getElementById('editor_main').scrollLeft,
                        y: con_obj.top + con_obj.height / 2 + document.getElementById('editor_main').scrollTop
                    }
                }                               
            }
        }

        else if (e.detail.event == 'start_dragging') {
            deselect_all();
        }

        else if (e.detail.event == 'draggable_dropped') {
            // See if we need to make the canvas smaller
            let max_x = 0;
            let max_y = 0;

            for (const [key, value] of Object.entries(line_locations)) {
                if (Object.entries(value.connectors).length == 0) {
                    if (value.x + 200 > max_x) {
                        max_x = value.x + 200;
                    }

                    if (value.y + 200 > max_y) {
                        max_y = value.y + 200;
                    }
                }

                else {
                    if (value.connectors[Object.entries(value.connectors).length-1].x > max_x) {
                        max_x = value.x;
                    }

                    if (value.connectors[Object.entries(value.connectors).length-1].y > max_y) {
                        max_y = value.y;
                    }
                    
                }
            }

            project.canvas_width = Math.max(screen.width * 1.5, max_x + 350);
            project.canvas_height = Math.max(screen.height * 1.5, max_y + 200);
        }

        else if (e.detail.event == 'dragging') {
            // Update look-up table
            let in_obj = document.getElementById('block_' + e.detail.id + '_in').getBoundingClientRect();

            let obj_left = in_obj.left + in_obj.width / 2;
            let obj_top = in_obj.top + in_obj.height / 2;

            line_locations[e.detail.id].x = obj_left + document.getElementById('editor_main').scrollLeft;
            line_locations[e.detail.id].y = obj_top + document.getElementById('editor_main').scrollTop;

            for (const cid in line_locations[e.detail.id].connectors) {
                let con_obj = document.getElementById('block_' + e.detail.id + '_c_' + cid).getBoundingClientRect();
                line_locations[e.detail.id].connectors[cid].x = con_obj.left + con_obj.width / 2 + document.getElementById('editor_main').scrollLeft;
                line_locations[e.detail.id].connectors[cid].y = con_obj.top + con_obj.height / 2 + document.getElementById('editor_main').scrollTop;
            }

            if (document.getElementById('editor_main').offsetHeight - obj_top < 100) {
                if (document.getElementById('editor_main').firstChild.offsetHeight - (obj_top + document.getElementById('editor_main').scrollTop) < 100) {
                    project.canvas_height += 100;
                }

                document.getElementById('editor_main').scrollTop += 30;
            }

            else if (obj_top < 50 && document.getElementById('editor_main').scrollTop > 0) {
                // @TODO: bind editor_main?
                document.getElementById('editor_main').scrollTop = document.getElementById('editor_main').scrollTop - 30;
                document.getElementById('block_' + e.detail.id).parentElement.dispatchEvent(new Event('mousemove'));
            }

            if (document.getElementById('editor_main').offsetWidth - obj_left < 200) {
                if (document.getElementById('editor_main').firstChild.offsetWidth - (obj_left + document.getElementById('editor_main').scrollLeft) < 200) {
                    project.canvas_width += 100;
                }
                document.getElementById('editor_main').scrollLeft = document.getElementById('editor_main').scrollLeft + 30;
                document.getElementById('block_' + e.detail.id).parentElement.dispatchEvent(new Event('mousemove'));
            }

            else if (obj_left < -50 && document.getElementById('editor_main').scrollLeft > 0) {
                document.getElementById('editor_main').scrollLeft = document.getElementById('editor_main').scrollLeft - 30;
                document.getElementById('block_' + e.detail.id).parentElement.dispatchEvent(new Event('mousemove'));
            }

        }
    }

    function handleSettingsMessage(e: Event) {
        if (e.detail.event == 'save_settings') {
            project.settings = e.detail.settings;
            gen_settings = e.detail.gen_settings;
            window.api.send('save-settings', {settings: e.detail.gen_settings});
        }
    }

    function handleChatGPTMessage(e: Event) {
        if (e.detail.event == 'run_all') {
            run_all();
            chatgpt_running = true;
        }
        else if (e.detail.event == 'send_chatgpt_message') {
            setTimeout(function() {
                send_chatgpt_message(e.detail.msg);
            }, 500);            
        }
        else if (e.detail.event == 'send_chatgpt_variation') {
            send_chatgpt_variation(e.detail.msg);
        }
    }

    function handleEditBlockMessage(e: Event) {
        if (e.detail.event == 'cancel') {
            edit_block = null;
            modal_edit.click();
        }

        else if (e.detail.event == 'save') {
            // Remove the line_locations for the connectors in case some were deleted/moved
            for (const [key, value] of Object.entries(line_locations[selected_id].connectors)) {
                if (!(key in e.detail.block.connectors)) {
                    delete line_locations[selected_id].connectors[key];
                }
            }

            project.blocks[selected_id] = e.detail.block;
            edit_block = null;
            modal_edit.click();
        }
    }

    function handleBlockMessage(e: Event) {
        if (e.detail.event == 'block_selected') {
            deselect_all();
            selected_id = e.detail.block_id;
        }
        
        else if (e.detail.event == 'edit_block') {
            edit_block = project.blocks[e.detail.block_id];
            modal_edit.click();
        }

        else if (e.detail.event == 'delete_block') {
            deselect_all();

            // Delete any blocks connecting to this one
            for (const [key, value] of Object.entries(project.blocks)) {
                for (let ci = 0; ci < value.connectors.length; ci++) {
                    let idx = value.connectors[ci].targets.indexOf(parseInt(e.detail.block_id));
                    
                    if (idx != -1) {
                        value.connectors[ci].targets.splice(idx, 1);
                    }
                }
            }

            delete project.blocks[e.detail.block_id];
            delete line_locations[e.detail.block_id];

            project.blocks = project.blocks;
        }      
        
        else if (e.detail.event == 'connector_loaded') {
            if (e.detail.block_id in line_locations) {
                // Location of the block should also be updated just in case, because the size of the block can change when adding/removing connectors.
                let in_obj = document.getElementById('block_' + e.detail.block_id + '_in').getBoundingClientRect();

                line_locations[e.detail.block_id].x = in_obj.left + in_obj.width / 2 + document.getElementById('editor_main').scrollLeft;
                line_locations[e.detail.block_id].y = in_obj.top + in_obj.height / 2 + document.getElementById('editor_main').scrollTop;


                // Update the location of the connector for building lines
                var con_obj = document.getElementById('block_' + e.detail.block_id + '_c_' + e.detail.connector_id).getBoundingClientRect();
                line_locations[e.detail.block_id].connectors[e.detail.connector_id] = {
                    x: con_obj.left + con_obj.width / 2 + document.getElementById('editor_main').scrollLeft,
                    y: con_obj.top + con_obj.height / 2 + document.getElementById('editor_main').scrollTop
                };
            }
        }
    }

    function line_clicked(e: MouseEvent) {
        select_line(e.target as HTMLElement);
        e.stopPropagation();    
    }

    function deselect_all() {
        selected_id = 0;
        let lines = document.getElementsByTagName('path');
        
        for (let i = 0; i < lines.length; i++) {
            lines[i].classList.remove('stroke-tilbot-secondary-hardpink');
        }

        document.getElementById('btn_del_line')?.classList.add('invisible');
    }

    function select_line(l: HTMLElement) {
        deselect_all();

        let line = document.querySelector("[data-from-block='-1']");

        let fromBlock = l.dataset.fromBlock;

        // Starting point
        if (fromBlock != '-1') {
            let fromConnector = l.dataset.fromConnector;
            let toBlock = l.dataset.toBlock;

            line = document.querySelector("[data-from-block='" + fromBlock +"'][data-from-connector='" + fromConnector + "'][data-to-block='" + toBlock + "']");
        }
        
        line.classList.add('stroke-tilbot-secondary-hardpink');
        let line_loc = line.getBoundingClientRect();
        let btn_del = document.getElementById('btn_del_line');
        btn_del?.setAttribute('style', 'left: ' + ((line_loc.left + line_loc.width / 2) + document.getElementById('editor_main').scrollLeft - 8) + 'px; top: ' + ((line_loc.top + line_loc.height / 2) + document.getElementById('editor_main').scrollTop - 28) + 'px');
        btn_del?.classList.remove('invisible');
    }

    function delete_selected_line() {
        let l = document.querySelector('path.stroke-tilbot-secondary-hardpink');

        let fromBlock = l.dataset.fromBlock;

        // Starting point
        if (fromBlock == '-1') {
            project.starting_block_id = -1;
        }
        else {
            let fromConnector = l.dataset.fromConnector;
            let toBlock = l.dataset.toBlock;

            let idx = project.blocks[fromBlock].connectors[fromConnector].targets.indexOf(parseInt(toBlock));

            if (idx !== -1) {
                project.blocks[fromBlock].connectors[fromConnector].targets.splice(idx, 1);

                // To refresh things.
                project.blocks[fromBlock].connectors[fromConnector].targets = project.blocks[fromBlock].connectors[fromConnector].targets;            
            }
        }
    }

    function editor_clicked(e: MouseEvent) {
        if (e.button == 0) {
            deselect_all();

            // Find and select a line if nearby, to increase the hitbox on the rather thin connector lines.
            for (let x = -3; x <= 3; x++) {
                for (let y = -3; y <= 3; y++) {
                    let el = document.elementFromPoint(e.clientX + x, e.clientY + y);
                    if (el && el.nodeName && el.nodeName.toLowerCase() == 'path') {
                        select_line(el as HTMLElement);
                        return;
                    }
                }
            }
        }
    }

    function editor_mousemove(e: MouseEvent) {
        if (dragging_connector.block_id !== undefined) {
            dragging_connector.mouseX = e.clientX + document.getElementById('editor_main').scrollLeft;
            dragging_connector.mouseY = e.clientY + document.getElementById('editor_main').scrollTop;
        }
    }

    function editor_mousedown(e: MouseEvent) {
        let block_id = e.target.getAttribute('data-block-id');
        let conn_id = e.target.getAttribute('data-connector-id');

        // Only allow to connect something to the starting point if it is not already connected to something
        if (block_id == '-1' && project.starting_block_id === -1) {
            deselect_all();
            dragging_connector = {
                block_id: -1,
                connector_id: 0,
                mouseX: line_locations['-1'].connectors[0].x,
                mouseY: line_locations['-1'].connectors[0].y
            };
        }

        if (block_id !== null && conn_id !== null) {
            deselect_all();
            dragging_connector = {
                block_id: block_id,
                connector_id: conn_id,
                mouseX: line_locations[block_id].connectors[conn_id].x,
                mouseY: line_locations[block_id].connectors[conn_id].y
            };            
        }
    }

    function editor_mouseup(e: MouseEvent) {
        let el = document.elementFromPoint(e.clientX, e.clientY);
        let el_id = el?.getAttribute('data-block-id');

        if (el_id !== null && el?.getAttribute('id') == 'block_' + el_id + '_in') {
            // Starting point
            if (dragging_connector.block_id == -1) {
                project.starting_block_id = parseInt(el_id);
            }

            else if (project.blocks[dragging_connector.block_id].connectors[dragging_connector.connector_id].targets.indexOf(parseInt(el_id)) == -1) {
                project.blocks[dragging_connector.block_id].connectors[dragging_connector.connector_id].targets.push(parseInt(el_id)); 
            
                // Force refresh
                project.blocks[dragging_connector.block_id].connectors[dragging_connector.connector_id].targets = project.blocks[dragging_connector.block_id].connectors[dragging_connector.connector_id].targets;
            }
        }
        
        dragging_connector = {};
    }

    function load_project(json_str:string) {
        // First clear everything
        project = {
        'name': 'New project',
        'current_block_id': 1,
        'blocks': {},
        'starting_block_id': 1,
        'canvas_width': 2240,
        'canvas_height': 1480,
        'bot_name': 'Tilbot',
        'avatar_image': '/client/img/default_profile.svg',
        'variables': [],
        'settings': {}
        };        
        line_locations = {};
        add_start_location();

        is_loading = true;
        num_draggable_loaded = 0;
        project = JSON.parse(json_str);
        project.blocks = project.blocks;
    }

    function run_all() {
        chatgpt_running = false;
        if (simulator.contentWindow !== null) {
            window.api.send('load-project-db', project);
            simulator.contentWindow.postMessage(JSON.stringify(project), "*");
        }        
    }

    function send_chatgpt_message(msg: string) {
        if (simulator.contentWindow !== null) {
            simulator.contentWindow.postMessage('chatgpt|' + msg, "*");
        }        
    }

    function send_chatgpt_variation(msg: string) {
        if (simulator.contentWindow !== null) {
            simulator.contentWindow.postMessage('variation|' + msg, "*");
        }
    }

    function run_selected() {
        if (simulator.contentWindow !== null) {
            let project_copy = JSON.parse(JSON.stringify(project));

            if (selected_id !== 0) {
                project_copy.starting_block_id = selected_id;
            }

            window.api.send('load-project-db', project_copy);

            simulator.contentWindow.postMessage(JSON.stringify(project_copy), "*");            
        }
    }
</script>