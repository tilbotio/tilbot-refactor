<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<div bind:this={draggable} style="left: {objAttributes.x}px; top: {objAttributes.y}px" on:mousedown={mouse_down} on:mouseup={mouse_up} on:mousemove={mouse_move} on:mouseleave={mouse_move} class="select-none absolute">
    <slot></slot>
</div>

<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";

    let draggable: HTMLDivElement;
    let is_dragging: boolean = false;
    let has_moved: boolean = false;

    let { objAttributes = $bindable({}), id = $bindable(0) } = $props();

    const dispatch = createEventDispatcher();

    onMount(() => {
        dispatch('message', {
            event: 'draggable_loaded',
            id: id
        });
    });

    function mouse_down(e: MouseEvent) {
        let btn_del = draggable.getElementsByClassName('btn_del');
        let btn_edit = draggable.getElementsByClassName('btn_edit');
        let conn_id = e.target.getAttribute('data-connector-id');

        if (e.button == 0 && conn_id === null && (btn_del.length == 0 || !btn_del[0].contains(e.target)) && (btn_edit.length == 0 || !btn_edit[0].contains(e.target))) {
            is_dragging = true;
            has_moved = false;

            dispatch('message', {
                event: 'start_dragging'
            });

        }

    }

    function mouse_up(e: MouseEvent) {
        if (e.button == 0 && is_dragging) {

            is_dragging = false;

            if (has_moved) {
                objAttributes.x = Math.round((e.x - (draggable.offsetWidth / 2) + document.getElementById('editor_main').scrollLeft) / 20) * 20;
                objAttributes.y = Math.round((e.y - (draggable.offsetHeight / 2) + document.getElementById('editor_main').scrollTop) / 20) * 20;

                dispatch('message', {
                    event: 'draggable_dropped'
                });
            }
        }
    }

    function mouse_move(e: MouseEvent) {
        if (is_dragging) {
            has_moved = true;

            draggable.style.left = Math.round((e.x - (draggable.offsetWidth / 2) + document.getElementById('editor_main').scrollLeft) / 20) * 20 + 'px';
            draggable.style.top = Math.round((e.y - (draggable.offsetHeight / 2) + document.getElementById('editor_main').scrollTop) / 20) * 20 + 'px';
            dispatch('message', {
                event: 'dragging',
                id: id
            })
        }
    }
</script>
