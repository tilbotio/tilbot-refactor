<script lang="ts">
  import {
    ChatBubbleLeft,
    EllipsisHorizontalCircle,
    Variable,
  } from "svelte-heros-v2";

  let { value = $bindable() } = $props();

  function checkDelBadges(this: any, event: KeyboardEvent) {
    if (
      event.key == "Backspace" ||
      event.key == "Delete" ||
      event.key == "ArrowLeft" ||
      event.key == "ArrowRight"
    ) {
      let val = $state.snapshot(value);
      let parent = this.parentElement as HTMLElement;
      let range = window.getSelection()?.getRangeAt(0).cloneRange();

      for (let i = 0; i < val.length; i++) {
        if (val[i].text !== undefined && val[i].text == this.innerText) {
          if (
            (event.key == "Backspace" || event.key == "ArrowLeft") &&
            range?.startOffset == 0 &&
            i > 0 &&
            val[i - 1].type !== undefined
          ) {
            let tmp = parent.children[i - 2] as HTMLElement;

            if (event.key == "Backspace") {
              if (i > 1 && val[i - 2].text !== undefined) {
                val[i - 2].text += val[i].text;
                val.splice(i - 1, 2);
              } else {
                val.splice(i - 1, 1);
              }

              value = val;
            }

            setTimeout(function () {
              tmp.focus();
              const selection = document.getSelection();
              selection?.collapse(tmp, 0);
              for (let i = 0; i < tmp.innerText.length; i++) {
                selection?.modify("move", "forward", "character");
              }
            }, 100);

            event.preventDefault();
            return false;
          }

          if (
            (event.key == "Delete" || event.key == "ArrowRight") &&
            range?.endOffset == this.innerText.length &&
            i < val.length - 1 &&
            val[i + 1].type !== undefined
          ) {
            let tmp = parent.children[i] as HTMLElement;

            if (event.key == "Delete") {
              if (i < val.length - 2 && val[i + 2].text !== undefined) {
                val[i].text += val[i + 2].text;
                val.splice(i + 1, 2);
              } else {
                val.splice(i + 1, 1);
              }

              value = val;

              setTimeout(function () {
                tmp.focus();
                const selection = document.getSelection();
                selection?.collapse(tmp, 0);
                for (let i = 0; i < tmp.innerText.length; i++) {
                  selection?.modify("move", "forward", "character");
                }
              }, 100);
            } else {
              tmp = parent.children[i + 2] as HTMLElement;
              tmp.focus();
            }

            event.preventDefault();
            return false;
          }
        }
      }
    }
  }

  function insertPrevTurnText() {
    value.push({
      type: "prevTurnText",
    });
    value.push({
      text: "",
    });

    setTimeout(function () {
      let editor = document.getElementById("richtexteditor");

      if (editor !== null) {
        let children = editor.children;

        let tmp = children[children.length - 1] as HTMLElement;
        tmp.focus();
      }
    }, 100);
  }

  function insertPrevConnectorLabel() {
    value.push({
      type: "prevConnectorLabel",
    });
    value.push({
      text: "",
    });

    setTimeout(function () {
      let editor = document.getElementById("richtexteditor");

      if (editor !== null) {
        let children = editor.children;

        let tmp = children[children.length - 1] as HTMLElement;
        tmp.focus();
      }
    }, 100);
  }
</script>

<div class="tooltip" data-tip="Insert text from previous turn">
  <button
    class="btn btn-square btn-outline btn-sm mt-2 mb-2"
    onclick={insertPrevTurnText}
  >
    <ChatBubbleLeft class="w-4 h-4" />
  </button>
</div>
<div class="tooltip" data-tip="Insert connector label from previous block">
  <button
    class="btn btn-square btn-outline btn-sm mt-2 mb-2"
    onclick={insertPrevConnectorLabel}
  >
    <EllipsisHorizontalCircle class="w-4 h-4" />
  </button>
</div>
<div class="tooltip" data-tip="Insert variable">
  <button class="btn btn-square btn-outline btn-sm mt-2 mb-2">
    <Variable class="w-4 h-4" />
  </button>
</div>
<div
  id="richtexteditor"
  class="textarea text-base textarea-bordered resize-none inset-y-2 w-full max-h-40 h-24 overflow-scroll"
>
  {#each value as v}
    {#if v.type !== undefined && v.type == "prevTurnText"}
      <div class="badge badge-secondary mx-2">
        <ChatBubbleLeft class="w-3 h-3" /> Previous turn text
      </div>
    {:else if v.type !== undefined && v.type == "prevConnectorLabel"}
      <div class="badge badge-neutral mx-2">
        <EllipsisHorizontalCircle class="w-3 h-3" /> Previous connector label
      </div>
    {:else}
      <div
        class="inline-flex"
        contenteditable="plaintext-only"
        bind:innerHTML={v.text}
        onkeydown={checkDelBadges}
      ></div>
    {/if}
  {/each}
</div>
