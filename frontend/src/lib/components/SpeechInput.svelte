<script lang="ts">
    import { onMount } from "svelte";
    import { Microphone, PaperAirplane, Play, Stop } from "svelte-heros-v2";
    import { playingTimeToMinSecString } from "$lib/utils/functions";

    const recorderMimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/webm",
        "audio/ogg"
    ];

    type Props = {
        onSendAudio: (audioBlob: Blob) => void;
    };

    const { onSendAudio }: Props = $props();

    let isSupported = $state(true);
    let isRecording: boolean = $state(false);
    let isPlaying: boolean = $state(false);
    let startRecordingTime: number = -1;
    let timeDisplay: string = $state("00:00");
    let chunks: Blob[] = $state([]);
    let lastRecording: Blob | null = $state(null);
    let recordingMimeType: string = $state("");
    let recorder: MediaRecorder;
    let player: HTMLAudioElement;

    function getSupportedRecorderMimeType(): string | null {
        if (typeof MediaRecorder === "undefined") {
            return null;
        }

        for (const mimeType of recorderMimeCandidates) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                return mimeType;
            }
        }

        return null;
    }

    function startRecording(): void {
        // In case there is a playback ongoing.
        stop();

        chunks = [];
        lastRecording = null;
        recorder.start();
        isRecording = true;
        startRecordingTime = Date.now();
        updateTime();
    }

    function updateTime() {
        if (isRecording) {
            timeDisplay = playingTimeToMinSecString((Date.now() - startRecordingTime) / 1000.0);
            setTimeout(updateTime, 1000);
        }        
        else if (isPlaying && player !== null) {
            timeDisplay = playingTimeToMinSecString(player.currentTime);
            setTimeout(updateTime, 1000);
        }
    }

    function stopRecording() {
        return new Promise<void>((resolve) => {
            recorder.onstop = () => {
                resolve();
            };

            recorder.stop();
        });
    }

    async function stop() {
        if (isRecording) {
            isRecording = false;
            await stopRecording();

            lastRecording = new Blob(chunks, { type: recordingMimeType || recorder.mimeType || chunks[0]?.type || "audio/webm" });
            const audioURL = window.URL.createObjectURL(lastRecording);
            player.src = audioURL;
        }
        else if (isPlaying) {
            player.pause();
            player.currentTime = 0;
            isPlaying = false;
        }
    }

    function play() {
        isPlaying = true;
        player.play();
        updateTime();
    }


    onMount(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log("getUserMedia supported.");
            navigator.mediaDevices
                .getUserMedia(
                // constraints - only audio needed for this app
                {
                    audio: true,
                },
                )

                // Success callback
                .then((stream) => {
                    const mimeType = getSupportedRecorderMimeType();
                    if (mimeType !== null) {
                        recorder = new MediaRecorder(stream, { mimeType });
                        recordingMimeType = mimeType;
                    }
                    else {
                        recorder = new MediaRecorder(stream);
                        recordingMimeType = recorder.mimeType;
                    }

                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) {
                            chunks.push(e.data);
                        }
                    };
                })

                // Error callback
                .catch((err) => {
                    console.error(`The following getUserMedia error occurred: ${err}`);
                    isSupported = false;
                });
        } else {
            console.log("getUserMedia not supported on your browser!");
            isSupported = false;
        }   
        
        player.addEventListener("ended", function() {
            player.currentTime = 0;
            isPlaying = false;
        });
    });    
</script>

  <div class="bg-gray-100 w-full h-20 drop-shadow-md flex justify-center items-center">
    {#if isSupported}
    <button
      class="btn btn-circle mr-4 bg-red-400 border-red-400 hover:bg-red-500 hover:border-red-500 {isRecording?'btn-disabled':''}"
      aria-label="Record audio message"
      onclick={startRecording}><Microphone variation="solid" class="ml-[0.5px] h-6 w-6 text-white" />
    </button>  
    {#if lastRecording == null || isPlaying || isRecording}
    <button
      class="btn btn-circle mr-4 bg-gray-400 border-gray-400 hover:bg-gray-500 hover:border-gray-500 {(lastRecording !== null || isRecording)?'':'btn-disabled'}"
      aria-label="Stop recording/playing audio"
      onclick={stop}><Stop variation="solid" class="ml-[1px] h-6 w-6 {(lastRecording !== null || isRecording)?'text-white':''}" />
    </button> 
    {/if}
    {#if lastRecording !== null && !isPlaying}
    <button
      class="btn btn-circle mr-4 bg-green-400 border-green-400 hover:bg-green-500 hover:border-green-500"
      aria-label="Play audio"
      onclick={play}><Play variation="solid" class="ml-[3px] h-6 w-6 text-white" />
    </button>        
    {/if}
    <button
      class="btn btn-circle absolute bottom-4 right-4 {lastRecording === null?'btn-disabled': ''}"
      aria-label="Send message"
      onclick={() => { if (lastRecording !== null) { onSendAudio(lastRecording); }}}><PaperAirplane class="h-6 w-6" /></button>    
    <span class="{isRecording?'text-red-700':''}">
        {timeDisplay}
    </span>
    {:else}
        Unfortunately, audio recording is not supported on your device.
    {/if}
  </div>

  <!-- The audio player for replaying recordings -->
   <div class="hidden">
    <audio bind:this={player}></audio>
   </div>