<script lang="ts">
    import { Camera } from "svelte-heros-v2";

    type Props = {
        currentImage: Blob | null;
    };

    let { currentImage = $bindable() }: Props = $props();
    let fileInput: HTMLInputElement;

    function addImage(): void {
        fileInput.click();
    }

    function handleFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            currentImage = input.files[0];
        }
    }
</script>

{#if currentImage}
    <img src={URL.createObjectURL(currentImage)} alt="Image to be sent" class="absolute max-w-[20%] max-h-[70%] top-[12px] right-[80px] "/>
    <button class="btn btn-circle btn-xs bg-black text-white absolute top-[3px] right-[72px]" aria-label="Remove image" onclick={() => currentImage = null}>x</button>
{:else}
<button
      class="relative bottom-[14px] right-8"
      aria-label="Add image"
      onclick={addImage}><Camera class="h-5 w-5" />
</button>

<input type="file" accept="image/*" capture="environment" class="hidden" bind:this={fileInput} onchange={handleFileChange} />
{/if}
