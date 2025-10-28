<script lang="ts">
  import { cloneDeep } from "lodash";

  import type { Component } from "svelte";
  import type { ProjectBlock } from "../../../../../common/project/types.ts";

  export type BlockPopupProps = {
    block: ProjectBlock;
  };

  type BaseBlockPopupProps = BlockPopupProps & {
    Icon: Component;
    children: Function;
    save: Function;
    cancel: Function;
    defaultProjectBlock?: ProjectBlock;
  };

  const {
    block,
    Icon,
    children,
    save,
    cancel,
    defaultProjectBlock,
  }: BaseBlockPopupProps = $props();

  let blockCopy = $state() as ProjectBlock;

  $effect.pre(() => {
    blockCopy = cloneDeep(Object.assign({}, defaultProjectBlock, block));
  });

  function ignoreEnterKey(e: KeyboardEvent) {
    if (e.key == "Enter") {
      e.preventDefault();
    }
  }
</script>

<span
  class="btn btn-sm btn-circle absolute right-2 top-2"
  onclick={() => {
    cancel();
  }}
  onkeydown={() => {
    cancel();
  }}
  tabindex="0"
  role="button">✕</span
>
<h3 class="text-lg font-bold">
  <Icon style="display: inline; vertical-align: sub" class="w-6 h-6" />

  <div
    class="inline"
    contenteditable="true"
    bind:textContent={blockCopy.name}
    onkeydown={ignoreEnterKey}
    onkeyup={ignoreEnterKey}
    role="textbox"
    tabindex="0"
  ></div>
</h3>

<div
  class="overflow-x-hidden overflow-y-auto"
  style="max-height: calc(100vh - 16em)"
>
  {@render children(blockCopy)}
</div>
<div class="divider"></div>
<p>
  <button
    class="btn btn-active"
    onclick={() => {
      save(blockCopy);
    }}>Save</button
  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button
    class="btn btn-outline"
    onclick={() => {
      cancel();
    }}>Cancel</button
  >
</p>
