<script lang="ts">
  import { onMount, type Component } from "svelte";
  import { page } from "$app/stores";
  import type {
    Project,
    ProjectBlock,
    ProjectBlockType,
    ProjectConnector,
  } from "../../../../common/project/types";
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
    PlusCircle,
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

  const block_components = {
    Auto: AutoBlock,
    MC: MCBlock,
    Text: TextBlock,
    Trigger: TriggerBlock,
  };

  const block_popup_components = {
    Auto: AutoBlockPopup,
    MC: MCBlockPopup,
    Text: TextBlockPopup,
    Trigger: TriggerBlockPopup,
  };

  let editor_main: HTMLElement = null as any;
  let jsonfileinput: HTMLElement = null as any;
  let simulator: HTMLIFrameElement = null as any;
  let start: HTMLElement = $state(null as any);
  let variables_window: any = $state();
  let settings_window: any = $state();

  let project: Project = $state({
    name: "New project",
    current_block_id: 1,
    blocks: {},
    starting_block_id: -1,
    canvas_width: 2240,
    canvas_height: 1480,
    bot_name: "Tilbot",
    variables: [],
    settings: { project_name: "New project" },
  });
  let modal_launch: HTMLInputElement | undefined = $state();
  let modal_edit: HTMLInputElement | undefined = $state();

  let selected_id = $state(0);
  let edit_block: ProjectBlock | null = $state(null);

  // I think the only way to have accurate and up-to-date lines is to create a sort of look-up table.
  let line_locations: {
    [key: string]: {
      x: number;
      y: number;
      connectors: { x: number; y: number }[];
    };
  } = $state({});

  let num_draggable_loaded = 0;
  let is_loading = false;

  let is_electron: boolean = $state(false);
  let local_ip = $state("");
  let public_ip = $state("");

  // For creating lines
  let dragging_connector = $state(
    {} as {
      block_id: number | null;
      connector_id: number | null;
      mouseX: number;
      mouseY: number;
    }
  );

  let gen_settings: { [key: string]: any } = $state({});
  let path = $state("");
  let chatgpt_running = $state(false);

  let alert_visible = $state(false);

  let btn_del_line_visible = $state(false);

  const window_api: any = (window as any)?.api;

  onMount(() => {
    // Set a property on the window so that the simulator knows it's part of the editor.
    window.isTilbotEditor = true;

    add_start_location();

    // Hack to fix the simulator in Electron (specifically on OS X)
    if (
      typeof navigator === "object" &&
      typeof navigator.userAgent === "string" &&
      navigator.userAgent.indexOf("Electron") >= 0
    ) {
      is_electron = true;
      simulator!.src = "index.html";

      window_api.receive("server-ip", (data: any) => {
        public_ip = data.public_ip;
        local_ip = data.local_ip;
      });

      window_api.receive("project-load", (project_str: string) => {
        load_project(project_str);
      });

      window_api.receive("project-saved", () => {
        alert_visible = true;

        setTimeout(function () {
          alert_visible = false;
        }, 3000);
      });

      window_api.receive("settings-load", (param: any) => {
        gen_settings = param.settings;
        path = param.path;

        if (gen_settings.chatgpt_sim_version === undefined) {
          gen_settings.chatgpt_sim_version = "gpt-3.5-turbo";
        }
      });

      window_api.send("get-settings");
    }

    if (!is_electron) {
      const url = $page.url;
      console.log(url.searchParams.get("project"));

      // For now, since editor online is not yet working, we send the user back to the dashboard.
      window.location.href = "/dashboard/";
    }

    project.canvas_width = screen.width * 1.5;
    project.canvas_height = screen.height * 1.5;
  });

  function add_start_location() {
    const rect = start.getBoundingClientRect();
    const xy = {
      x: rect.left + rect.width / 2 + editor_main.scrollLeft,
      y: rect.bottom + editor_main.scrollTop,
    };
    line_locations["-1"] = { ...xy, connectors: [xy] };
  }

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
      selected_id = current_block_id;
    }, 50);
  }

  function btn_load_click() {
    window_api.send("do-load");
    //jsonfileinput.click(); // For web version
  }

  function btn_save_click() {
    window_api.send("do-save", JSON.stringify(project));
  }

  function btn_variables_click() {
    variables_window!.show();
  }

  function btn_settings_click() {
    settings_window!.show();
  }

  function btn_launch_click() {
    modal_launch!.click();
    window_api.send("open-server", JSON.stringify(project));
  }

  function btn_close_server_click() {
    modal_launch!.click();
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

  function registerBlock(id: string, block: any) {
    const scrollLeft = editor_main.scrollLeft;
    const scrollTop = editor_main.scrollTop;

    const block_rect = document
      .getElementById(`block_${id}_in`)!
      .getBoundingClientRect();

    function center(rect: DOMRect) {
      return {
        x: rect.left + rect.width / 2 + scrollLeft,
        y: rect.top + rect.height / 2 + scrollTop,
      };
    }

    const connectors: any = {};

    for (const cid in block.connectors) {
      const connector_rect = document
        .getElementById(`block_${id}_c_${cid}`)!
        .getBoundingClientRect();
      connectors[cid] = center(connector_rect);
    }

    line_locations[id] = { ...center(block_rect), connectors };
  }

  function handleDraggableMessage(e: CustomEvent) {
    const blocks = project.blocks;
    if (e.detail.event == "draggable_loaded") {
      if (is_loading) {
        num_draggable_loaded++;

        const blockEntries = Object.entries(blocks) as [string, any][];
        if (num_draggable_loaded == blockEntries.length) {
          is_loading = false;

          // Build the look-up table for connecting lines.
          for (const [id, block] of blockEntries) {
            registerBlock(id, block);
          }
        }
      } else {
        // Just add the one new entry in the collection
        const id = e.detail.id;
        registerBlock(id, blocks[id]);
      }
    } else if (e.detail.event == "start_dragging") {
      deselect_all();
    } else if (e.detail.event == "draggable_dropped") {
      // See if we need to make the canvas smaller
      let max_x = 0;
      let max_y = 0;

      for (const value of Object.values(line_locations)) {
        const connectors = value.connectors;
        if (connectors.length == 0) {
          if (value.x + 200 > max_x) {
            max_x = value.x + 200;
          }

          if (value.y + 200 > max_y) {
            max_y = value.y + 200;
          }
        } else {
          const lastConnector = connectors[connectors.length - 1];
          if (lastConnector.x > max_x) {
            max_x = value.x;
          }

          if (lastConnector.y > max_y) {
            max_y = value.y;
          }
        }
      }

      project.canvas_width = Math.max(screen.width * 1.5, max_x + 350);
      project.canvas_height = Math.max(screen.height * 1.5, max_y + 200);
    } else if (e.detail.event == "dragging") {
      const id = e.detail.id;
      registerBlock(id, blocks[id]);

      // Update look-up table
      const block_rect = document
        .getElementById(`block_${id}_in`)!
        .getBoundingClientRect();

      const obj_left = block_rect.left + block_rect.width / 2;
      const obj_top = block_rect.top + block_rect.height / 2;

      const scrollLeft = editor_main.scrollLeft;
      const scrollTop = editor_main.scrollTop;
      const firstChild = editor_main.firstChild as HTMLElement;

      if (editor_main.offsetHeight - obj_top < 100) {
        if (firstChild.offsetHeight - (obj_top + scrollTop) < 100) {
          project.canvas_height += 100;
        }
        editor_main.scrollTop += 30;
      } else if (obj_top < 50 && scrollTop > 0) {
        // @TODO: bind editor_main?
        editor_main.scrollTop = scrollTop - 30;
      }

      if (editor_main.offsetWidth - obj_left < 200) {
        if (firstChild.offsetWidth - (obj_left + scrollLeft) < 200) {
          project.canvas_width += 100;
        }
        editor_main.scrollLeft = scrollLeft + 30;
      } else if (obj_left < -50 && scrollLeft > 0) {
        editor_main.scrollLeft = scrollLeft - 30;
      }
    }
  }

  function handleSettingsMessage(e: CustomEvent) {
    const detail = e.detail;
    if (detail.event == "save_settings") {
      project.settings = detail.settings;
      gen_settings = detail.gen_settings;
      window_api.send("save-settings", { settings: gen_settings });
    }
  }

  function handleChatGPTMessage(e: CustomEvent) {
    if (e.detail.event == "run_all") {
      run_all();
      chatgpt_running = true;
    } else if (e.detail.event == "send_chatgpt_message") {
      setTimeout(function () {
        send_chatgpt_message(e.detail.msg);
      }, 500);
    } else if (e.detail.event == "send_chatgpt_variation") {
      send_chatgpt_variation(e.detail.msg);
    }
  }

  function handleEditBlockMessage(e: CustomEvent) {
    const detail = e.detail;
    const event = detail.event;
    if (event == "cancel") {
      edit_block = null;
      modal_edit!.click();
    } else if (event == "save") {
      // Remove the line_locations for the connectors in case some were deleted/moved
      const block = detail.block;
      const blockConnectors = block.connectors;
      const lineConnectors = line_locations[selected_id].connectors;
      for (const key of lineConnectors.keys()) {
        if (!(key in blockConnectors)) {
          delete lineConnectors[key];
        }
      }

      project.blocks[selected_id] = block;
      edit_block = null;
      modal_edit!.click();
    }
  }

  function handleBlockMessage(e: CustomEvent) {
    const detail = e.detail;
    const event = detail.event;
    const blockId = detail.block_id;
    if (event == "block_selected") {
      deselect_all();
      selected_id = blockId;
    } else if (event == "edit_block") {
      edit_block = project.blocks[blockId];
      modal_edit!.click();
    } else if (event == "delete_block") {
      deselect_all();

      const intBlockId = parseInt(blockId);
      // Delete any blocks connecting to this one
      for (const block of Object.values(project.blocks) as any[]) {
        for (const connector of block.connectors) {
          const targets = connector.targets;
          const index = targets.indexOf(intBlockId);
          if (index != -1) {
            targets.splice(index, 1);
          }
        }
      }

      delete project.blocks[blockId];
      delete line_locations[blockId];
    } else if (event == "connector_loaded") {
      registerBlock(blockId, project.blocks[blockId]);
    }
  }

  function line_clicked(e: MouseEvent) {
    select_line(e.target as HTMLElement);
    e.stopPropagation();
  }

  function deselect_all() {
    selected_id = 0;
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
    const target = e.target! as HTMLElement;
    const { blockId, connectorId } = target.dataset;

    if (blockId == undefined) {
      return;
    }
    const connectors = line_locations[blockId].connectors;

    const blockIdInt = parseInt(blockId);
    if (blockIdInt === -1) {
      // Only allow to connect something to the starting point if it is not already connected to something
      if (project.starting_block_id === -1) {
        deselect_all();
        const connector = connectors[0];
        dragging_connector = {
          block_id: -1,
          connector_id: 0,
          mouseX: connector.x,
          mouseY: connector.y,
        };
      }
    } else if (connectorId != undefined) {
      const connectorIdInt = parseInt(connectorId);
      const connector = connectors[connectorIdInt];
      deselect_all();
      dragging_connector = {
        block_id: blockIdInt,
        connector_id: connectorIdInt,
        mouseX: connector.x,
        mouseY: connector.y,
      };
    }
  }

  function editor_mouseup(e: MouseEvent) {
    const dragging_connector_block_id = dragging_connector.block_id;
    if (dragging_connector_block_id == null) {
      return;
    }

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
      if (dragging_connector.block_id == -1) {
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

    dragging_connector.block_id = null;
  }

  function load_project(json_str: string) {
    // First clear everything
    project = {
      current_block_id: 1,
      blocks: {},
      starting_block_id: 1,
      canvas_width: 2240,
      canvas_height: 1480,
      bot_name: "Tilbot",
      variables: [],
      settings: {
        project_name: "New project",
      },
    };
    line_locations = {};
    add_start_location();

    is_loading = true;
    num_draggable_loaded = 0;

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

      if (selected_id !== 0) {
        project_copy.starting_block_id = selected_id;
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

  <Variables
    bind:variablewindow={variables_window}
    variables={project.variables}
  />

  <Settings
    bind:settingswindow={settings_window}
    settings={project.settings}
    gensettings={gen_settings}
    path={path + "avatar/"}
    on:message={handleSettingsMessage}
  />

  <input type="checkbox" bind:this={modal_edit} class="modal-toggle" />
  <div class="modal">
    <div class="modal-box relative max-w-4xl">
      {#if edit_block !== null}
        {@const SvelteComponent_1 = block_popup_components[edit_block.type]}
        <SvelteComponent_1
          objAttributes={edit_block}
          on:message={handleEditBlockMessage}
        />
      {/if}
    </div>
  </div>

  <input type="checkbox" bind:this={modal_launch} class="modal-toggle" />
  <div class="modal">
    <div class="modal-box relative">
      <h3 class="text-lg font-bold">
        <svg
          style="display: inline; vertical-align: sub"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>

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
            onkeyup={action}
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
          {@render blockMenuItem("Automatically proceed", PlusCircle, "Auto")}
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
        <CheckCircle />
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
        style:width={`${project.canvas_width} px`}
        style:height={`${project.canvas_height} px`}
      >
        <svg
          class="absolute pointer-events-none z-40"
          style:width={`${project.canvas_width} px`}
          style:height={`${project.canvas_height} px`}
        >
          {#snippet line(id: string, cid: number, target: string)}
            {@const source = line_locations[id].connectors[cid]}
            {@const destination = line_locations[target]}
            {@const x_offset = Math.abs(destination.x - source.x)}
            <path
              d={`
                M${source.x},${source.y}
                L${source.x + x_offset * 0.05},${source.y}
                C${source.x + x_offset * 0.5},${source.y}
                 ${destination.x - x_offset * 0.5},${destination.y}
                 ${destination.x - x_offset * 0.05},${destination.y}
                L${destination.x},${destination.y}
              `}
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
          {/snippet}

          {#if Object.entries(line_locations).length > 1}
            {#each Object.entries(project.blocks) as [id, block]}
              {#each block.connectors.entries() as [cid, connector]}
                {#each connector.targets as target}
                  {@render line(id, cid, `${target}`)}
                {/each}
              {/each}
            {/each}

            {#if project.starting_block_id !== -1}
              {@render line("-1", 0, `${project.starting_block_id}`)}
            {/if}
          {/if}

          <!-- For creating new lines -->
          {#if dragging_connector.block_id != undefined && dragging_connector.connector_id != undefined}
            {@const line_connector =
              line_locations[dragging_connector.block_id].connectors[
                dragging_connector.connector_id
              ]}
            <line
              class="z-50"
              x1={line_connector.x}
              y1={line_connector.y}
              x2={dragging_connector.mouseX}
              y2={dragging_connector.mouseY}
              stroke="black"
              stroke-width="2"
            />
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

        <Start bind:el={start}></Start>

        {#if project.blocks !== undefined}
          {#each Object.entries(project.blocks) as [id, block]}
            <Draggable
              objAttributes={block}
              on:message={handleDraggableMessage}
              id={parseInt(id)}
            >
              {@const SvelteComponent_2 = block_components[block.type]}
              <SvelteComponent_2
                blockId={parseInt(id)}
                selectedId={selected_id}
                objAttributes={block}
                on:message={handleBlockMessage}
              />
            </Draggable>
          {/each}
        {/if}
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
          settings={project.settings}
          gensettings={gen_settings}
          variables={project.variables}
          on:message={handleChatGPTMessage}
        ></ChatGPT>
      </div>

      <div id="simulator" class="mockup-phone w-full my-1.5 h-full">
        <div class="camera"></div>
        <div class="display h-full w-full">
          <div class="artboard artboard-demo h-full">
            <iframe
              src="/"
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
