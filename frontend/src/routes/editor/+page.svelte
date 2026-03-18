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
  import { setOrDelete } from "$lib/utils/functions";
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

  let editorContainer: HTMLElement = $state(null) as any;
  let jsonFileInput: HTMLElement = null as any;
  let simulator: HTMLIFrameElement = null as any;
  let variablesWindow: any = $state();
  let settingsWindow: any = $state();

  let project: Project = $state(_.cloneDeep(defaultProject));

  let launchModal = $state() as HTMLInputElement;
  let editModal = $state() as HTMLInputElement;

  let selectedBlockId: string | null = $state(null);
  let editingBlock: ProjectBlock | null = $state(null);

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
  let isElectron = $state() as boolean;
  let localIP = $state("");
  let publicIP = $state("");

  // For creating lines
  let draggingConnector = $state(
    {} as {
      blockId: string | null;
      connectorId: number | null;
      mouseX: number;
      mouseY: number;
    }
  );

  let generalSettings: { [key: string]: any } = $state({});
  let path = $state("");
  let chatGPTrunning = $state(false);

  let alertVisible = $state(false);

  let isLineDeleteButtonVisible = $state(false);

  let windowAPI: any;

  onMount(() => {
    windowAPI = (window as any)?.api;

    // Set a property on the window so that the simulator knows it's part of the editor.
    window.isTilbotEditor = true;

    isElectron =
      typeof navigator === "object" &&
      typeof navigator.userAgent === "string" &&
      navigator.userAgent.indexOf("Electron") >= 0;

    if (isElectron) {
      // Hack to fix the simulator in Electron (specifically on OS X)
      simulator!.src = "index.html";

      (async () => {
        try {
          ({ public_ip: publicIP, local_ip: localIP } =
            await windowAPI.invoke("server-ip"));
        } catch (e) {
          console.log(`Error fetching server IP: ${e}`);
        }
      })();

      (async () => {
        try {
          ({ generalSettings, path } = await windowAPI.invoke("load-settings"));
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

  function newBlock(type: ProjectBlockType) {
    // @TODO: take into account current level / groupblock
    const connectors: ProjectConnector[] = [];
    const currentBlockId = project.current_block_id;
    const currentBlock: ProjectBlock = (project.blocks[currentBlockId] = {
      type: type,
      name: `Block ${project.current_block_id}`,
      content: "",
      x: editorContainer.scrollLeft + screen.width * 0.35,
      y: editorContainer.scrollTop + screen.height * 0.4,
      connectors,
    });

    if (type === "Auto") {
      connectors.push({
        type: "Basic",
        targets: [] as number[],
      });
    } else if (type === "Text") {
      connectors.push({
        type: "Labeled",
        label: "[else]",
        targets: [],
      });
    } else if (type === "Trigger") {
      currentBlock.name = `Trigger ${project.current_block_id}`;
    }

    project.current_block_id++;

    deselectAll();

    setTimeout(function () {
      selectedBlockId = `${currentBlockId}`;
    }, 50);
  }

  async function loadButtonClicked() {
    const loadedProject = await windowAPI.invoke("load-project");
    if (loadedProject != null) {
      loadProject(loadedProject);
    }
    //jsonfileinput.click(); // For web version
  }

  async function saveButtonClicked() {
    if (await windowAPI.invoke("save-project", $state.snapshot(project))) {
      alertVisible = true;

      setTimeout(function () {
        alertVisible = false;
      }, 3000);
    }
  }

  function variablesButtonClicked() {
    variablesWindow.show();
  }

  function settingsButtonClicked() {
    settingsWindow.show();
  }

  function launchButtonClicked() {
    launchModal.click();
    windowAPI.send("open-server", JSON.stringify(project));
  }

  function closeServerButtonClicked() {
    launchModal.click();
    windowAPI.send("close-server");
  }

  function importProjectFile(event: Event) {
    if (event.target !== null) {
      const tar = event.target as HTMLInputElement;

      if (tar.files !== null && tar.files[0] !== undefined) {
        const reader = new FileReader();
        reader.onload = function (loadEvent: ProgressEvent) {
          const target = loadEvent.target as FileReader;
          if (target !== null) {
            const res = target.result as string;
            loadProject(JSON.parse(res));
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
    windowAPI.send("save-settings", $state.snapshot(generalSettings));
  }

  function chatGPTrunAll() {
    runAll();
    chatGPTrunning = true;
  }

  function chatGPTsendMessage(message: string) {
    setTimeout(function () {
      sendChatGPTmessage(message);
    }, 500);
  }

  function saveBlock(block: ProjectBlock) {
    project.blocks[selectedBlockId!] = block;
    editingBlock = null;
    editModal.click();
  }

  function cancelBlock() {
    editingBlock = null;
    editModal.click();
  }

  function editBlock(blockId: string) {
    editingBlock = project.blocks[blockId];
    editModal.click();
  }

  function removeBlock(blockId: string) {
    deselectAll();

    const blocks = project.blocks;
    const blockIdInt = parseInt(blockId);

    // Delete any blocks connecting to this one
    for (const block of Object.values(blocks)) {
      for (const connector of block.connectors) {
        const targets = connector.targets;
        const index = targets.indexOf(blockIdInt);
        if (index != -1) {
          targets.splice(index, 1);
        }
      }
    }

    delete blocks[blockId];
  }

  function selectBlock(blockId: string) {
    deselectAll();
    selectedBlockId = blockId;
  }

  function lineClicked(e: MouseEvent) {
    selectLine(e.target as HTMLElement);
    e.stopPropagation();
  }

  function deselectAll() {
    selectedBlockId = null;
    const lines = document.getElementsByTagName("path");

    for (const line of lines) {
      line.classList.remove("stroke-tilbot-secondary-hardpink");
    }

    isLineDeleteButtonVisible = false;
  }

  function selectLine(line: HTMLElement) {
    deselectAll();

    line.classList.add("stroke-tilbot-secondary-hardpink");

    const rect = line.getBoundingClientRect();
    const left = rect.left + rect.width / 2 + editorContainer.scrollLeft - 8;
    const top = rect.top + rect.height / 2 + editorContainer.scrollTop - 28;

    const style = document.getElementById("btn_del_line")!.style;
    style.setProperty("left", `${left} px`);
    style.setProperty("top", `${top} px`);
    isLineDeleteButtonVisible = true;
  }

  function deleteSelectedLine() {
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

  const maxClickOffset = 3;
  const clickOffsets: [number, number][] = [];
  for (let x = -maxClickOffset; x <= maxClickOffset; x++) {
    for (let y = -maxClickOffset; y <= maxClickOffset; y++) {
      clickOffsets.push([x, y]);
    }
  }

  // Distance from origin, squared
  function length2(x: number, y: number) {
    return x * x + y * y;
  }

  // Try the points closest to the mouse position first
  clickOffsets.sort((a, b) => length2(...a) - length2(...b));

  function editorClicked(e: MouseEvent) {
    if (e.button == 0) {
      deselectAll();

      // Find and select a line if nearby, to increase the hitbox on the rather thin connector lines.
      for (const [x, y] of clickOffsets) {
        const el = document.elementFromPoint(e.clientX + x, e.clientY + y);
        if (el?.nodeName?.toLowerCase() === "path") {
          selectLine(el as HTMLElement);
          return;
        }
      }
    }
  }

  function editorMouseMoved(e: MouseEvent) {
    if (draggingConnector.blockId != null) {
      draggingConnector.mouseX = e.clientX + editorContainer.scrollLeft;
      draggingConnector.mouseY = e.clientY + editorContainer.scrollTop;
    }
  }

  function editorMouseDown(e: MouseEvent) {
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
        deselectAll();
        draggingConnector = {
          blockId,
          connectorId: 0,
          mouseX: e.clientX + editorContainer.scrollLeft,
          mouseY: e.clientY + editorContainer.scrollTop,
        };
      }
    } else if (connectorId != undefined) {
      const connectorIdInt = parseInt(connectorId);
      deselectAll();
      draggingConnector = {
        blockId,
        connectorId: connectorIdInt,
        mouseX: e.clientX + editorContainer.scrollLeft,
        mouseY: e.clientY + editorContainer.scrollTop,
      };
    }
  }

  function editorMouseUp(e: MouseEvent) {
    const draggingConnectorBlockId = draggingConnector.blockId;
    if (draggingConnectorBlockId == null) {
      return;
    }

    draggingConnector.blockId = null;

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
      if (draggingConnectorBlockId === "-1") {
        project.starting_block_id = parseInt(blockId);
      } else {
        const targets =
          project.blocks[draggingConnectorBlockId].connectors[
            draggingConnector.connectorId!
          ].targets;
        const blockIdInt = parseInt(blockId);
        if (targets.indexOf(blockIdInt) == -1) {
          targets.push(blockIdInt);
        }
      }
    }
  }

  function loadProject(loadedProject: Project) {
    project = _.cloneDeep({ ...defaultProject, ...loadedProject });
  }

  function runAll() {
    chatGPTrunning = false;
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      windowAPI.send("load-project-db", project);
      contentWindow.postMessage(
        { project: JSON.stringify(project), path: path },
        "*"
      );
    }
  }

  function sendChatGPTmessage(msg: string) {
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      contentWindow.postMessage("chatgpt|" + msg, "*");
    }
  }

  function sendChatCPTvariation(msg: string) {
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      contentWindow.postMessage("variation|" + msg, "*");
    }
  }

  function runSelected() {
    const contentWindow = simulator.contentWindow;
    if (contentWindow != null) {
      const projectCopy = JSON.parse(JSON.stringify(project));

      if (selectedBlockId != null) {
        projectCopy.starting_block_id = parseInt(selectedBlockId);
      }

      windowAPI.send("load-project-db", projectCopy);

      contentWindow.postMessage(JSON.stringify(projectCopy), "*");
    }
  }
</script>

<div id="editor" class="overflow-hidden">
  <!--<a href="/dashboard">-->
  <img src="images/tilbot_logo.svg" alt="Tilbot logo" class="ml-1 mt-2 w-48" />
  <!--</a>-->

  <Variables bind:this={variablesWindow} variables={project.variables} />

  <Settings
    bind:this={settingsWindow}
    projectSettings={project.settings}
    settings={generalSettings}
    path="{path}/avatar"
    save={saveSettings}
  />

  <input type="checkbox" bind:this={editModal} class="modal-toggle" />
  <div class="modal">
    <div class="modal-box relative max-w-4xl">
      {#if editingBlock !== null}
        {@const BlockPopupComponent =
          blockPopupComponentTypes[editingBlock.type]}
        <BlockPopupComponent
          block={editingBlock}
          save={saveBlock}
          cancel={cancelBlock}
        />
      {/if}
    </div>
  </div>

  <input type="checkbox" bind:this={launchModal} class="modal-toggle" />
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
        Connect devices on the same network to: {localIP}:2801
      </p>
      <p class="py-4">
        Or via the internet: {publicIP}:2801<br />
        <span class="text-sm"
          >(make sure your router is set up to forward port 2801)</span
        >
      </p>
      <br />
      <div class="divider"></div>
      <p>
        <button class="btn btn-active" onclick={closeServerButtonClicked}
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
      {@render menuItem(tip, Icon, () => newBlock(type))}
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

      {@render menuItem("Variables & data", Variable, variablesButtonClicked)}
      {@render menuItem("Settings", Cog6Tooth, settingsButtonClicked)}
      {#if isElectron}
        {@render menuItem("Launch project", RocketLaunch, launchButtonClicked)}
      {/if}

      <li>&nbsp;<br /><br /></li>

      {@render menuItem("Load project", Folder, loadButtonClicked)}
      {@render menuItem("Save project", FolderArrowDown, saveButtonClicked)}
    </ul>
  </div>

  <div
    id="alert"
    class={[
      "flex justify-center w-full absolute top-4",
      { invisible: !alertVisible },
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
      bind:this={editorContainer}
      class="grow overflow-auto"
      style="max-width: calc(100vw - 24rem)"
      role="button"
      tabindex="-1"
      onclick={editorClicked}
      onkeyup={() => {}}
      onmousedown={editorMouseDown}
      onmousemove={editorMouseMoved}
      onmouseup={editorMouseUp}
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
              {@const xOffset = Math.abs(destination.x - source.x)}

              <path
                d="
                  M{source.x},{source.y}
                  L{source.x + xOffset * 0.05},{source.y}
                  C{source.x + xOffset * 0.5},{source.y}
                   {destination.x - xOffset * 0.5},{destination.y}
                   {destination.x - xOffset * 0.05},{destination.y}
                  L{destination.x},{destination.y}
                "
                stroke-width="2"
                fill="none"
                data-from-block={id}
                data-from-connector={cid}
                data-to-block={target}
                onclick={lineClicked}
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
          {#if draggingConnector.blockId != undefined && draggingConnector.connectorId != undefined}
            {@const connector =
              lineLocations[draggingConnector.blockId]?.out?.[
                draggingConnector.connectorId
              ]}
            {#if connector}
              <line
                class="z-50"
                x1={connector.x}
                y1={connector.y}
                x2={draggingConnector.mouseX}
                y2={draggingConnector.mouseY}
                stroke="black"
                stroke-width="2"
              />
            {/if}
          {/if}
        </svg>

        <div
          id="btn_del_line"
          class={["absolute", { invisible: !isLineDeleteButtonVisible }]}
        >
          <button
            class="btn btn-xs btn-circle bg-tilbot-secondary-hardpink border-tilbot-secondary-hardpink hover:bg-white hover:text-tilbot-secondary-hardpink hover:border-tilbot-secondary-hardpink"
            onclick={deleteSelectedLine}><XMark class="h-4 w-4" /></button
          >
        </div>

        <Start
          bind:lineLocation={
            () => (lineLocations["-1"] ??= { out: [] }),
            (value) => setOrDelete(lineLocations, "-1", value)
          }
        />

        {#each Object.entries(project.blocks ?? {}) as [blockId, block] (blockId)}
          <Draggable {block} parent={editorContainer}>
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
        <button class="btn gap-2" onclick={runAll}>
          <Play class="w-6 h-6" />
          Run all
        </button>

        <ChatGPT
          isRunning={chatGPTrunning}
          projectSettings={project.settings}
          {generalSettings}
          variables={project.variables}
          runAll={chatGPTrunAll}
          sendMessage={chatGPTsendMessage}
          sendVariation={sendChatCPTvariation}
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
  bind:this={jsonFileInput}
  onchange={importProjectFile}
/>
