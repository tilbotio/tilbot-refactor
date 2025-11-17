<script lang="ts">
  import _ from "lodash";
  import { onMount, type Component } from "svelte";
  import type {
    Project,
    ProjectBlock,
    ProjectBlockType,
    ProjectConnector,
    ProjectSettings,
    GeneralSettings,
  } from "../../../../common/project/types";
  import { defaultProject } from "../../../../common/project/types";
  import { setOrDelete } from "../../../../common/svelte-utils";
  import Variables from "./variables.svelte";
  import Settings from "./settings.svelte";
  import ChatGPT from "./chatgpt.svelte";
  import Draggable from "./draggable.svelte";
  import Start from "./start.svelte";
  import AutoBlock from "./blocks/auto.svelte";
  import MCBlock from "./blocks/mc.svelte";
  import TextBlock from "./blocks/text.svelte";
  import TriggerBlock from "./blocks/trigger.svelte";
  import AutoBlockPopup from "./block_popups/auto.svelte";
  import MCBlockPopup from "./block_popups/mc.svelte";
  import TextBlockPopup from "./block_popups/text.svelte";
  import TriggerBlockPopup from "./block_popups/trigger.svelte";
  import {
    SquaresPlus,
    Clock,
    ListBullet,
    Language,
    BellAlert,
    Play,
    XMark,
    Variable,
    Cog6Tooth,
    RocketLaunch,
    Folder,
    FolderArrowDown,
    CheckCircle,
  } from "svelte-heros-v2";

  const blockComponentTypes = {
    Auto: AutoBlock,
    MC: MCBlock,
    Text: TextBlock,
    Trigger: TriggerBlock,
  };

  const blockPopupComponentTypes = {
    Auto: AutoBlockPopup,
    MC: MCBlockPopup,
    Text: TextBlockPopup,
    Trigger: TriggerBlockPopup,
  };

  let editor_main: HTMLElement = $state(null) as any;
  let jsonfileinput: HTMLElement = null as any;
  let simulator: HTMLIFrameElement = null as any;
  let variables_window: any = $state();
  let settings_window: any = $state();

  let project: Project = $state(_.cloneDeep(defaultProject));

  let modal_launch = $state() as HTMLInputElement;
  let modal_edit = $state() as HTMLInputElement;

  let selectedBlockId: string | null = $state(null);
  let edit_block: ProjectBlock | null = $state(null);

  // I think the only way to have accurate and up-to-date lines is to create a sort of look-up table.
  const lineLocations: {
    [key: string]: {
      in?: { x: number; y: number };
      out: { x: number; y: number }[];
    };
  } = $state({});

  // Initialization will happen in onMount(), we don't know the value yet and
  // there's no sane default we can give, so leave it undefined for now.
  // Setting "boolean | undefined" as the type is also not quite a good fit,
  // as this value should never be undefined during the normal lifetime.
  let is_electron = $state() as boolean;
  let local_ip = $state("");
  let public_ip = $state("");

  // For creating lines
  let dragging_connector = $state(
    {} as {
      block_id: string | null;
      connector_id: number | null;
      mouseX: number;
      mouseY: number;
    }
  );

  let generalSettings: { [key: string]: any } = $state({});
  let path = $state("");
  let chatgpt_running = $state(false);

  let alert_visible = $state(false);

  let btn_del_line_visible = $state(false);

  let window_api: any;

  onMount(() => {
    window_api = (window as any)?.api;

    // Set a property on the window so that the simulator knows it's part of the editor.
    window.isTilbotEditor = true;

    is_electron =
      typeof navigator === "object" &&
      typeof navigator.userAgent === "string" &&
      navigator.userAgent.indexOf("Electron") >= 0;

    if (is_electron) {
      // Hack to fix the simulator in Electron (specifically on OS X)
      simulator!.src = "index.html";

      (async () => {
        try {
          ({ public_ip, local_ip } = await window_api.invoke("server-ip"));
        } catch (e) {
          console.log(`Error fetching server IP: ${e}`);
        }
      })();

      (async () => {
        try {
          ({ generalSettings, path } =
            await window_api.invoke("load-settings"));
        } catch (e) {
          console.log(`Error loading settings: ${e}`);
        }
      })();
    } else {
      // For now, since editor online is not yet working, we send the user back to the dashboard.
      window.location.href = "/dashboard/";
    }

    project.canvas_width = screen.width * 1.5;
    project.canvas_height = screen.height * 1.5;
  });

  function new_block(type: ProjectBlockType) {
    // @TODO: take into account current level / groupblock
    const connectors: ProjectConnector[] = [];
    const current_block_id = project.current_block_id;
    const current_block: ProjectBlock = (project.blocks[current_block_id] = {
      type: type,
      name: `Block ${project.current_block_id}`,
      content: "",
      x: editor_main.scrollLeft + screen.width * 0.35,
      y: editor_main.scrollTop + screen.height * 0.4,
      connectors,
    });

    if (type == "Auto") {
      connectors.push({
        type: "Basic",
        targets: [] as number[],
      });
    } else if (type == "Text") {
      connectors.push({
        type: "Labeled",
        label: "[else]",
        targets: [],
      });
    } else if (type == "Trigger") {
      current_block.name = `Trigger ${project.current_block_id}`;
    }

    project.current_block_id++;

    deselect_all();

    setTimeout(function () {
      selectedBlockId = `${current_block_id}`;
    }, 50);
  }

  async function btn_load_click() {
    const projectJson = await window_api.invoke("load-project");
    if (projectJson != null) {
      load_project(projectJson);
    }
    //jsonfileinput.click(); // For web version
  }

  async function btn_save_click() {
    if (await window_api.invoke("save-project", JSON.stringify(project))) {
      alert_visible = true;

      setTimeout(function () {
        alert_visible = false;
      }, 3000);
    }
  }

  function btn_variables_click() {
    variables_window.show();
  }

  function btn_settings_click() {
    settings_window.show();
  }

  function btn_launch_click() {
    modal_launch.click();
    window_api.send("open-server", JSON.stringify(project));
  }

  function btn_close_server_click() {
    modal_launch.click();
    window_api.send("close-server");
  }

  function import_project_file(event: Event) {
    if (event.target !== null) {
      const tar = event.target as HTMLInputElement;

      if (tar.files !== null && tar.files[0] !== undefined) {
        const reader = new FileReader();
        reader.onload = function (load_event) {
          if (load_event.target !== null) {
            const res = load_event.target.result as string;
            load_project(res);
          }
        };

        reader.readAsText(tar.files[0]);
      }
    }
  }

  $effect(() => {
    // See if we need to make the canvas smaller or larger
    const max = { x: 0, y: 0 };
    const blocks = project.blocks ?? {};

    for (const [id, lineLocation] of Object.entries(lineLocations)) {
      const padCoords = lineLocation.out;
      const block = blocks[id];
      const lastPadCoords =
        padCoords?.length > 0
          ? padCoords[padCoords.length - 1]
          : { x: block.x! + 200, y: block.y! + 200 };

      if (max.x < lastPadCoords.x) {
        max.x = lastPadCoords.x;
      }

      if (max.y < lastPadCoords.y) {
        max.y = lastPadCoords.y;
      }
    }

    project.canvas_width = Math.max(screen.width * 1.5, max.x + 350);
    project.canvas_height = Math.max(screen.height * 1.5, max.y + 200);
  });

  function saveSettings(
    generalSettings: GeneralSettings,
    projectSettings: ProjectSettings
  ) {
    project.settings = projectSettings;
    generalSettings = generalSettings;
    window_api.send("save-settings", { settings: generalSettings });
  }

  function chatgptRunAll() {
    run_all();
    chatgpt_running = true;
  }

  function chatgptSendMessage(message: string) {
    setTimeout(function () {
      send_chatgpt_message(message);
    }, 500);
  }

  function saveBlock(block: ProjectBlock) {
    project.blocks[selectedBlockId!] = block;
    edit_block = null;
    modal_edit.click();
  }

  function cancelBlock() {
    edit_block = null;
    modal_edit.click();
  }

  function editBlock(blockId: number) {
    edit_block = project.blocks[blockId];
    modal_edit.click();
  }

  function removeBlock(blockId: number) {
    deselect_all();

    const blocks = project.blocks;

    // Delete any blocks connecting to this one
    for (const block of Object.values(blocks)) {
      for (const connector of block.connectors) {
        const targets = connector.targets;
        const index = targets.indexOf(blockId);
        if (index != -1) {
          targets.splice(index, 1);
        }
      }
    }

    delete blocks[blockId];
  }

  function selectBlock(blockId: string) {
    deselect_all();
    selectedBlockId = blockId;
  }

  function line_clicked(e: MouseEvent) {
    select_line(e.target as HTMLElement);
    e.stopPropagation();
  }

  function deselect_all() {
    selectedBlockId = null;
    const lines = document.getElementsByTagName("path");

    for (const line of lines) {
      line.classList.remove("stroke-tilbot-secondary-hardpink");
    }

    btn_del_line_visible = false;
  }

  function select_line(line: HTMLElement) {
    deselect_all();

    line.classList.add("stroke-tilbot-secondary-hardpink");

    const rect = line.getBoundingClientRect();
    const left = rect.left + rect.width / 2 + editor_main.scrollLeft - 8;
    const top = rect.top + rect.height / 2 + editor_main.scrollTop - 28;

    const style = document.getElementById("btn_del_line")!.style;
    style.setProperty("left", `${left} px`);
    style.setProperty("top", `${top} px`);
    btn_del_line_visible = true;
  }

  function delete_selected_line() {
    const line: HTMLElement = document.querySelector(
      "path.stroke-tilbot-secondary-hardpink"
    )!;

    const { fromBlock, fromConnector, toBlock } = line.dataset;

    // Starting point
    if (fromBlock === "-1") {
      project.starting_block_id = -1;
    } else {
      const targets =
        project.blocks[fromBlock!].connectors[parseInt(fromConnector!)].targets;
      const index = targets.indexOf(parseInt(toBlock!));
      if (index !== -1) {
        targets.splice(index, 1);
      }
    }
  }

  const max_click_offset = 3;
  const click_offsets: [number, number][] = [];
  for (let x = -max_click_offset; x <= max_click_offset; x++) {
    for (let y = -max_click_offset; y <= max_click_offset; y++) {
      click_offsets.push([x, y]);
    }
  }

  // Distance from origin, squared
  function length2(x: number, y: number) {
    return x * x + y * y;
  }

  // Try the points closest to the mouse position first
  click_offsets.sort((a, b) => length2(...a) - length2(...b));

  function editor_clicked(e: MouseEvent) {
    if (e.button == 0) {
      deselect_all();

      // Find and select a line if nearby, to increase the hitbox on the rather thin connector lines.
      for (const [x, y] of click_offsets) {
        const el = document.elementFromPoint(e.clientX + x, e.clientY + y);
        if (el?.nodeName?.toLowerCase() === "path") {
          select_line(el as HTMLElement);
          return;
        }
      }
    }
  }

  function editor_mousemove(e: MouseEvent) {
    if (dragging_connector.block_id != null) {
      dragging_connector.mouseX = e.clientX + editor_main.scrollLeft;
      dragging_connector.mouseY = e.clientY + editor_main.scrollTop;
    }
  }

  function editor_mousedown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target) {
      return;
    }

    const { blockId, connectorId } = target.dataset;

    if (blockId == undefined) {
      return;
    }

    if (blockId === "-1") {
      // Only allow to connect something to the starting point if it is not already connected to something
      if (project.starting_block_id === -1) {
        deselect_all();
        dragging_connector = {
          block_id: blockId,
          connector_id: 0,
          mouseX: e.clientX + editor_main.scrollLeft,
          mouseY: e.clientY + editor_main.scrollTop,
        };
      }
    } else if (connectorId != undefined) {
      const connectorIdInt = parseInt(connectorId);
      deselect_all();
      dragging_connector = {
        block_id: blockId,
        connector_id: connectorIdInt,
        mouseX: e.clientX + editor_main.scrollLeft,
        mouseY: e.clientY + editor_main.scrollTop,
      };
    }
  }

  function editor_mouseup(e: MouseEvent) {
    const dragging_connector_block_id = dragging_connector.block_id;
    if (dragging_connector_block_id == null) {
      return;
    }

    dragging_connector.block_id = null;

    const element = document.elementFromPoint(
      e.clientX,
      e.clientY
    ) as HTMLElement;
    if (element == null) {
      return;
    }

    const { blockId } = element.dataset;
    if (blockId == null) {
      return;
    }

    if (element.getAttribute("id") == `block_${blockId}_in`) {
      // Starting point
      if (dragging_connector.block_id === "-1") {
        project.starting_block_id = parseInt(blockId);
      } else {
        const targets =
          project.blocks[dragging_connector_block_id].connectors[
            dragging_connector.connector_id!
          ].targets;
        const blockIdInt = parseInt(blockId);
        if (targets.indexOf(blockIdInt) == -1) {
          targets.push(blockIdInt);
        }
      }
    }
  }

  function load_project(json_str: string) {
    // First clear everything
    project = _.cloneDeep(defaultProject);

    // Introduce a small delay so that everything will load properly (incl. lines)
    setTimeout(function () {
      project = JSON.parse(json_str);
      project.blocks = project.blocks;
    }, 500);
  }

  function run_all() {
    chatgpt_running = false;
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      window_api.send("load-project-db", project);
      contentWindow.postMessage(
        { project: JSON.stringify(project), path: path },
        "*"
      );
    }
  }

  function send_chatgpt_message(msg: string) {
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      contentWindow.postMessage("chatgpt|" + msg, "*");
    }
  }

  function send_chatgpt_variation(msg: string) {
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      contentWindow.postMessage("variation|" + msg, "*");
    }
  }

  function run_selected() {
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      const project_copy = JSON.parse(JSON.stringify(project));

      if (selectedBlockId != null) {
        project_copy.starting_block_id = parseInt(selectedBlockId);
      }

      window_api.send("load-project-db", project_copy);

      contentWindow.postMessage(JSON.stringify(project_copy), "*");
    }
  }
</script>

<div id="editor" class="overflow-hidden">
  <!--<a href="/dashboard">-->
  <img src="images/tilbot_logo.svg" alt="Tilbot logo" class="ml-1 mt-2 w-48" />
  <!--</a>-->

  <Variables bind:this={variables_window} variables={project.variables} />

  <Settings
    bind:this={settings_window}
    projectSettings={project.settings}
    settings={generalSettings}
    path="{path}/avatar"
    save={saveSettings}
  />

  <input type="checkbox" bind:this={modal_edit} class="modal-toggle" />
  <div class="modal">
    <div class="modal-box relative max-w-4xl">
      {#if edit_block !== null}
        {@const BlockPopupComponent = blockPopupComponentTypes[edit_block.type]}
        <BlockPopupComponent
          block={edit_block}
          save={saveBlock}
          cancel={cancelBlock}
        />
      {/if}
    </div>
  </div>

  <input type="checkbox" bind:this={modal_launch} class="modal-toggle" />
  <div class="modal">
    <div class="modal-box relative">
      <h3 class="text-lg font-bold">
        <RocketLaunch
          class="w-6 h-6"
          style="display: inline; vertical-align: sub"
        />
        Project running as server
      </h3>
      <div class="divider"></div>
      <p class="py-4">
        Connect devices on the same network to: {local_ip}:2801
      </p>
      <p class="py-4">
        Or via the internet: {public_ip}:2801<br />
        <span class="text-sm"
          >(make sure your router is set up to forward port 2801)</span
        >
      </p>
      <br />
      <div class="divider"></div>
      <p>
        <button class="btn btn-active" onclick={btn_close_server_click}
          >Close server</button
        >
      </p>
    </div>
  </div>
  <div id="menu" class="fixed float-left z-10 mt-4">
    {#snippet menuItem(tip: string, Icon: Component, action: any)}
      <div class="tooltip tooltip-right" data-tip={tip}>
        <li>
          <!-- svelte-ignore a11y_missing_attribute -->
          <a
            class="active:bg-tilbot-secondary-hardpink"
            onclick={action}
            onkeyup={() => {}}
            role="button"
            tabindex="0"
            aria-label={tip}><Icon class="w-6 h-6" /></a
          >
        </li>
      </div>
    {/snippet}
    {#snippet blockMenuItem(
      tip: string,
      Icon: Component,
      type: ProjectBlockType
    )}
      {@render menuItem(tip, Icon, () => new_block(type))}
    {/snippet}

    <ul class="menu p-2 rounded-box bg-slate-200 ml-2 mt-2 shadow-md">
      <li>
        <a class="active:bg-tilbot-secondary-hardpink" id="add-block"
          ><SquaresPlus class="w-6 h-6" /></a
        >
        <ul class="bg-slate-100">
          {@render blockMenuItem("Automatically proceed", Clock, "Auto")}
          {@render blockMenuItem("Multiple choice", ListBullet, "MC")}
          {@render blockMenuItem("Text", Language, "Text")}
        </ul>
      </li>
      {@render blockMenuItem("Add trigger", BellAlert, "Trigger")}

      <li>&nbsp;<br /><br /></li>

      {@render menuItem("Variables & data", Variable, btn_variables_click)}
      {@render menuItem("Settings", Cog6Tooth, btn_settings_click)}
      {#if is_electron}
        {@render menuItem("Launch project", RocketLaunch, btn_launch_click)}
      {/if}

      <li>&nbsp;<br /><br /></li>

      {@render menuItem("Load project", Folder, btn_load_click)}
      {@render menuItem("Save project", FolderArrowDown, btn_save_click)}
    </ul>
  </div>

  <div
    id="alert"
    class={[
      "flex justify-center w-full absolute top-4",
      { invisible: !alert_visible },
    ]}
  >
    <div class="alert alert-success shadow-lg w-[250px]">
      <div>
        <CheckCircle class="stroke-current flex-shrink-0 h-6 w-6" />
        <span>Project saved!</span>
      </div>
    </div>
  </div>

  <div class="flex flex-row w-screen h-screen absolute top-0 z-0">
    <div
      id="editor_main"
      bind:this={editor_main}
      class="grow overflow-auto"
      style="max-width: calc(100vw - 24rem)"
      role="button"
      tabindex="-1"
      onclick={editor_clicked}
      onkeyup={() => {}}
      onmousedown={editor_mousedown}
      onmousemove={editor_mousemove}
      onmouseup={editor_mouseup}
    >
      <div
        class="relative"
        style:width="{project.canvas_width}px"
        style:height="{project.canvas_height}px"
      >
        <svg
          class="absolute pointer-events-none z-40"
          style:width="{project.canvas_width}px"
          style:height="{project.canvas_height}px"
        >
          {#snippet line(id: string, cid: number, target: number)}
            {@const source = lineLocations[id]?.out?.[cid]}
            {@const destination = lineLocations[target]?.in}

            {#if source && destination}
              {@const x_offset = Math.abs(destination.x - source.x)}

              <path
                d="
                  M{source.x},{source.y}
                  L{source.x + x_offset * 0.05},{source.y}
                  C{source.x + x_offset * 0.5},{source.y}
                   {destination.x - x_offset * 0.5},{destination.y}
                   {destination.x - x_offset * 0.05},{destination.y}
                  L{destination.x},{destination.y}
                "
                stroke-width="2"
                fill="none"
                data-from-block={id}
                data-from-connector={cid}
                data-to-block={target}
                onclick={line_clicked}
                onkeyup={() => {}}
                role="button"
                tabindex="0"
                class="pointer-events-auto stroke-tilbot-primary-300"
              />
            {/if}
          {/snippet}

          {#each Object.entries(project.blocks ?? {}) as [id, block] (id)}
            {#each block.connectors.entries() as [cid, connector] (cid)}
              {#each connector.targets as target (target)}
                {@render line(id, cid, target)}
              {/each}
            {/each}
          {/each}

          {#if project.starting_block_id !== -1}
            {@render line("-1", 0, project.starting_block_id)}
          {/if}

          <!-- For creating new lines -->
          {#if dragging_connector.block_id != undefined && dragging_connector.connector_id != undefined}
            {@const connector =
              lineLocations[dragging_connector.block_id]?.out?.[
                dragging_connector.connector_id
              ]}
            {#if connector}
              <line
                class="z-50"
                x1={connector.x}
                y1={connector.y}
                x2={dragging_connector.mouseX}
                y2={dragging_connector.mouseY}
                stroke="black"
                stroke-width="2"
              />
            {/if}
          {/if}
        </svg>

        <div
          id="btn_del_line"
          class={["absolute", { invisible: !btn_del_line_visible }]}
        >
          <button
            class="btn btn-xs btn-circle bg-tilbot-secondary-hardpink border-tilbot-secondary-hardpink hover:bg-white hover:text-tilbot-secondary-hardpink hover:border-tilbot-secondary-hardpink"
            onclick={delete_selected_line}><XMark class="h-4 w-4" /></button
          >
        </div>

        <Start {lineLocations} />

        {#each Object.entries(project.blocks ?? {}) as [blockId, block] (blockId)}
          <Draggable {block} parent={editor_main}>
            {@const BlockComponent = blockComponentTypes[block.type]}
            <BlockComponent
              {blockId}
              {block}
              bind:lineLocation={
                () => (lineLocations[blockId] ??= { out: [] }),
                (value) => setOrDelete(lineLocations, blockId, value)
              }
              selected={selectedBlockId === blockId}
              edit={editBlock}
              select={() => selectBlock(blockId)}
              remove={removeBlock}
            />
          </Draggable>
        {/each}
      </div>
    </div>

    <div class="flex flex-col w-full max-w-sm pr-1.5 pl-1.5 bottom-0">
      <div id="simulator_menu" class="w-full mr-1.5 mt-2 text-center">
        <button class="btn gap-2" onclick={run_all}>
          <Play class="w-6 h-6" />
          Run all
        </button>

        <ChatGPT
          is_running={chatgpt_running}
          projectSettings={project.settings}
          {generalSettings}
          variables={project.variables}
          runAll={chatgptRunAll}
          sendMessage={chatgptSendMessage}
          sendVariation={send_chatgpt_variation}
        ></ChatGPT>
      </div>

      <div id="simulator" class="mockup-phone w-full my-1.5 h-full">
        <div class="camera"></div>
        <div class="display h-full w-full">
          <div class="artboard artboard-demo h-full">
            <iframe
              src="about:blank"
              class="w-full h-full"
              bind:this={simulator}
              title="Simulator"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Hidden file field to be able to load files -->
<input
  name="upload"
  type="file"
  class="invisible"
  bind:this={jsonfileinput}
  onchange={import_project_file}
/>
