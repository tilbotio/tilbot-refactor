<script lang="ts">
  import {
    ChatBubbleLeft,
    EllipsisHorizontalCircle,
    Variable,
  } from "svelte-heros-v2";
  import type { Message } from "#lib/types/types.ts";
  import ChatMessage from "#lib/components/ChatMessage.svelte";
  import Variablepopup from "./variablepopup.svelte";

  let { value = $bindable(), variables = $bindable([]), allowInsertPrevTurnText = $bindable(true), allowInsertPrevConnectorLabel = $bindable(true) } = $props();

  let variablePopup: Variablepopup;

  let preview: Message = $state({
    content: "",
    from: "bot",
  });

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

  // Last known caret position (index in value + character offset), since buttons/popups steal focus
  let caret: { index: number; offset: number } | null = null;

  function saveCaret(index: number, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !el.contains(selection.anchorNode)) {
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    range.selectNodeContents(el);
    range.setEnd(selection.anchorNode!, selection.anchorOffset);
    caret = { index, offset: range.toString().length };
  }

  // Inserts an item at the saved caret position, or at the end if there is none
  function insertItem(item: any) {
    let index = value.length - 1;
    let offset = value[index]?.text?.length ?? 0;

    if (caret !== null && value[caret.index]?.text !== undefined) {
      index = caret.index;
      offset = Math.min(caret.offset, value[index].text.length);
    }

    const text: string = value[index]?.text ?? "";
    let before = text.slice(0, offset);
    const after = text.slice(offset);

    // Chrome keeps a placeholder "\n" at the end of text after Enter, which would push the badge a line down
    if (after === "" && before.endsWith("\n")) {
      before = before.slice(0, -1);
    }

    if (value[index]?.text === undefined) {
      value.push(item, { text: "" });
      index = value.length - 2;
    } else {
      value.splice(index, 1, { text: before }, item, { text: after });
      index += 1;
    }

    caret = { index: index + 1, offset: 0 };

    const target = index + 1;
    setTimeout(function () {
      const editor = document.getElementById("richtexteditor");
      const el = editor?.children[target] as HTMLElement | undefined;
      if (el) {
        el.focus();
        const selection = window.getSelection();
        selection?.selectAllChildren(el);
        selection?.collapseToStart();
      }
    }, 100);
  }

  function insertPrevTurnText() {
    insertItem({ type: "prevTurnText" });
  }

  function insertPrevConnectorLabel() {
    insertItem({ type: "prevConnectorLabel" });
  }

  function openVariableWindow() {
    variablePopup.showModal();
  }

  function insertVariable(
    type: string,
    variable: string,
    column: string,
    isRandomRow: boolean,
    filter: any
  ) {
    insertItem({
      type: "variable",
      variableType: type,
      variable: variable,
      column: column,
      isRandomRow: isRandomRow,
      filter: filter,
    });
  }

  // Clicking empty space in the editor places the caret at the end of the last text element
  function focusEnd(event: MouseEvent) {
    const editor = event.currentTarget as HTMLElement;
    if (event.target !== editor) return;

    const editables = editor.querySelectorAll<HTMLElement>("[contenteditable]");
    const last = editables[editables.length - 1];
    if (!last) return;

    last.focus();
    const selection = window.getSelection();
    selection?.selectAllChildren(last);
    selection?.collapseToEnd();
  }

  function buildPreview() {
    let p: string[] = [];
    for (let i = 0; i < value.length; i++) {
      if (value[i].type === undefined && value[i].text !== undefined) {
        p.push(value[i].text);
      } else if (value[i].type === "prevTurnText") {
        p.push("[Previous turn text]");
      } else if (value[i].type === "prevConnectorLabel") {
        p.push("[Previous connector label]");
      } else if (value[i].type === "variable") {
        p.push("[Variable " + value[i].variable + "]");
      }
    }

    preview.content = p.join(" ");
  }
</script>

<Variablepopup bind:this={variablePopup} {variables} onSave={insertVariable}
></Variablepopup>

{#if allowInsertPrevTurnText}
<div class="tooltip" data-tip="Insert text from previous turn">
  <button
    class="btn btn-square btn-outline btn-sm mt-2 mb-2"
    onclick={insertPrevTurnText}
  >
    <ChatBubbleLeft class="w-4 h-4" />
  </button>
</div>
{/if}
{#if allowInsertPrevConnectorLabel}
<div class="tooltip" data-tip="Insert connector label from previous block">
  <button
    class="btn btn-square btn-outline btn-sm mt-2 mb-2"
    onclick={insertPrevConnectorLabel}
  >
    <EllipsisHorizontalCircle class="w-4 h-4" />
  </button>
</div>
{/if}
<div class="tooltip" data-tip="Insert variable">
  <button
    class="btn btn-square btn-outline btn-sm mt-2 mb-2"
    onclick={openVariableWindow}
  >
    <Variable class="w-4 h-4" />
  </button>
</div>
<div
  id="richtexteditor"
  class="textarea text-base resize-none inset-y-2 w-full max-h-40 h-24 overflow-scroll cursor-text"
    onclick={focusEnd}
>
  {#each value as v, i}
    {#if v.type !== undefined && v.type == "prevTurnText"}
      <div class="badge badge-secondary mx-2 inline-flex">
        <ChatBubbleLeft class="w-3 h-3" /> Previous turn text
      </div>
    {:else if v.type !== undefined && v.type == "prevConnectorLabel"}
      <div class="badge badge-neutral mx-2 inline-flex">
        <EllipsisHorizontalCircle class="w-3 h-3" /> Previous connector label
      </div>
    {:else if v.type !== undefined && v.type == "variable"}
      <div class="badge badge-info mx-2 inline-flex">
        <Variable class="w-3 h-3 mr-2" />
        {#if v.isRandomRow !== undefined && v.isRandomRow}
          random row from
        {:else if v.column !== undefined && v.column !== ""}
          {v.column} from
        {/if}
        {v.variable}
      </div>
    {:else}
      <div
        class="inline whitespace-pre-wrap outline-hidden align-middle"
        contenteditable="plaintext-only"
        bind:textContent={v.text}
        onkeydown={checkDelBadges}
        onkeyup={(e) => saveCaret(i, e)}
        onclick={(e) => saveCaret(i, e)}
        onfocusout={(e) => saveCaret(i, e)}
      ></div>
    {/if}
  {/each}
</div>

<button class="btn btn-sm btn-outline mt-2 mb-4" onclick={buildPreview}>
  Preview message
</button>

{#if preview.content !== ""}
<div>
  <ChatMessage
    message={preview}
    newBotMessageBlock={false}
    ttsCompleteEvent={() => {}}
  />
</div>
{/if}

<div class="divider mt-4 mb-4"></div>
