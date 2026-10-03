<script lang="ts">
    import { onMount } from "svelte";
    import { Bars3BottomLeft, Microphone, PaperAirplane, Play, Stop } from "svelte-heros-v2";
    import { playingTimeToMinSecString } from "$lib/utils/functions";

    const recorderMimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/webm",
        "audio/ogg"
    ];

    type Props = {
        onSendAudio: (audioBlob: Blob) => void;
        onSwitchSpeechMode: (() => void) | null;
    };

    const { onSendAudio, onSwitchSpeechMode }: Props = $props();

    let isSupported = $state(true);
    let errorMessage = $state("");
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

    let stream: MediaStream | null = null;

    function releaseStream() {
        stream?.getTracks().forEach((t) => t.stop());
        stream = null;
    }

    // getUserMedia must be called from a user gesture on iOS Safari, so the stream
    // and recorder are created on click instead of on mount.
    async function startRecording(): Promise<void> {
        // In case there is a playback ongoing.
        // Must be the first call in the tap handler: no await before it, or Safari rejects it.
        const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });

        try {
            stream = await streamPromise;
        } catch (err) {
            console.error(`The following getUserMedia error occurred: ${err}`);
            errorMessage = `${(err as Error).name}: ${(err as Error).message}`;
            return;
        }

        await stop();

        const mimeType = getSupportedRecorderMimeType();
        recorder = mimeType !== null ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recordingMimeType = mimeType ?? recorder.mimeType;

        chunks = [];
        lastRecording = null;
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
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
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            isSupported = false;
            errorMessage = !window.isSecureContext
                ? "Insecure context (HTTPS required)"
                : !navigator.mediaDevices?.getUserMedia ? "getUserMedia unavailable" : "MediaRecorder unavailable (iOS 14.3+ required)";
        }
        player.addEventListener("ended", function() {
            player.currentTime = 0;
            isPlaying = false;
        });
    });    
</script>

  <div class="bg-gray-100 w-full h-20 drop-shadow-md flex justify-center items-center">
    <div class="w-[calc(100%-8rem)] flex justify-center items-center">
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
        {#if errorMessage}<span class="text-red-700 text-xs mr-2">{errorMessage}</span>{/if}
        <span class="{isRecording?'text-red-700':''}">
            {timeDisplay}
        </span>
        {:else}
            Unfortunately, audio recording is not supported on your device.
            {#if errorMessage}<br /><span class="text-xs">({errorMessage})</span>{/if}
        {/if}
    </div>
    {#if !isRecording && !isPlaying && onSwitchSpeechMode !== null}
    <button
    class="btn btn-sm btn-circle bg-white mr-8 ml-4"
    aria-label="Send message"
    onclick={onSwitchSpeechMode}><Bars3BottomLeft class="h-5 w-5" /></button
    >      
    {/if}
    <button
    class="btn btn-circle mr-4 {lastRecording === null?'btn-disabled': ''}"
    aria-label="Send message"
    onclick={() => { if (lastRecording !== null) { onSendAudio(lastRecording); }}}><PaperAirplane class="h-6 w-6" /></button>    
  </div>

  <!-- The audio player for replaying recordings -->
   <div class="hidden">
    <audio bind:this={player}></audio>
   </div>