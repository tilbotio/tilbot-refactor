<script lang="ts">
    import { onMount } from "svelte";
    import { Play, Stop } from "svelte-heros-v2";

    import type { Message } from "$lib/types/types";
    import { playingTimeToMinSecString } from "$lib/utils/functions";

    type Props = {
        message: Message;
    };

    const { message }: Props = $props();
    let player: HTMLAudioElement;
    let duration = $state<number>(0);
    let isPlaying: boolean = $state(false);
    let currentTime: number = $state(0);

    function playStop() {
        if (isPlaying) {
            isPlaying = false;
            player.pause();
            player.currentTime = 0;
        } else {
            isPlaying = true;
            player.play();
            updateTime();
        }
    }

    function updateTime() {
        if (isPlaying && player !== null) {
            currentTime = player.currentTime;
            setTimeout(updateTime, 1000);
        }
    }    

    onMount(() => {
        if (message.audio !== undefined) {
            const audioURL = window.URL.createObjectURL(message.audio);
            if (player) {
                player.onloadedmetadata = () => {
                    duration = player?.duration;
                }
                player.addEventListener("ended", function() {
                    player.currentTime = 0;
                    isPlaying = false;
                });                
                player.src = audioURL;
            }
        }
    });       
</script>

  <div class="chat ml-2 mr-2 chat-end">
    <div class="w-10"></div>
    <div class="chat-bubble whitespace-pre-line bg-tilbot-secondary-hardpink">
        <div class="flex items-center mt-1" onclick={playStop}>
            {#if isPlaying}
            <Stop variation="solid" class="h-4 w-4 text-white cursor-pointer mr-2" />
            {:else}
            <Play variation="solid" class="h-4 w-4 text-white cursor-pointer mr-2" />
            {/if}
            <span class="text-xs text-gray-200">{playingTimeToMinSecString(currentTime)}</span>
            <progress class="progress w-48 ml-4 mr-4" value="{Math.round(currentTime) / Math.round(duration) * 100 || 0}" max="100"></progress>
            <span class="text-xs text-gray-200">{playingTimeToMinSecString(duration)}</span>
        </div>
        {#if message.content != ""}
            <div class="italic text-sm mt-4">
                Some content here
            </div>
        {/if}
    </div>
  </div>

  <div class="hidden">
    <audio bind:this={player}></audio>
  </div>