<div bind:this={draggable} on:mousedown={mouse_down} on:mouseup={mouse_up} on:mousemove={mouse_move} on:mouseleave={mouse_move} class="select-none absolute">
    <slot></slot>
</div>

<script type="ts">
    import { onMount, createEventDispatcher } from "svelte";

    let draggable: HTMLDivElement;
    let is_dragging: boolean = false;
    export let objAttributes = {};
    export let id = 0;

    const dispatch = createEventDispatcher();

    onMount(() => {
        draggable.style.left = objAttributes.x + 'px';
        draggable.style.top = objAttributes.y + 'px';

        dispatch('message', {
            event: 'draggable_loaded',
            id: id
        });
    });

    function mouse_down(e: MouseEvent) {
        if (e.button == 0 && e.target.getAttribute('data-connector-id') === null) {
            is_dragging = true;

            dispatch('message', {
                event: 'start_dragging'
            });

        }
        
    }

    function mouse_up(e: MouseEvent) {
        if (e.button == 0) {
            is_dragging = false;
        
            objAttributes.x = e.x - (draggable.offsetWidth / 2);
            objAttributes.y = e.y - (draggable.offsetHeight / 2);
        }
    }

    function mouse_move(e: MouseEvent) {
        if (is_dragging) {
            draggable.style.left = Math.round((e.x - (draggable.offsetWidth / 2) + document.getElementById('editor_main').scrollLeft) / 20) * 20 + 'px';
            draggable.style.top = Math.round((e.y - (draggable.offsetHeight / 2) + document.getElementById('editor_main').scrollTop) / 20) * 20 + 'px';
            dispatch('message', {
                event: 'dragging',
                id: id
            })
        }
    }
</script>