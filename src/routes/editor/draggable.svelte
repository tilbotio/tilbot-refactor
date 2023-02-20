<div bind:this={draggable} on:mousedown={mouse_down} on:mouseup={mouse_up} on:mousemove={mouse_move} on:mouseleave={mouse_move} class="select-none absolute">
    <slot></slot>
</div>

<script type="ts">
    import { onMount } from "svelte";

    let draggable: HTMLDivElement;
    let is_dragging: boolean = false;
    export let objAttributes = {};

    onMount(() => {
        draggable.style.left = objAttributes.x + 'px';
        draggable.style.top = objAttributes.y + 'px';
    });

    function mouse_down() {
        is_dragging = true;
    }

    function mouse_up(e: MouseEvent) {
        is_dragging = false;
        
        objAttributes.x = e.x - (draggable.offsetWidth / 2);
        objAttributes.y = e.y - (draggable.offsetHeight / 2);
    }

    function mouse_move(e: MouseEvent) {
        console.log(document.getElementById('editor_main').scrollLeft);
        if (is_dragging) {
            draggable.style.left = (e.x - (draggable.offsetWidth / 2) + document.getElementById('editor_main').scrollLeft) + 'px';
            draggable.style.top = (e.y - (draggable.offsetHeight / 2) + document.getElementById('editor_main').scrollTop) + 'px';
        }
    }
</script>