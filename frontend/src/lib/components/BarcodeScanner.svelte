<script lang="ts">
  /**
   * @prop onClose: callback function, will be provided by parent component
   * @prop onScan: callback function, will be provided by parent component
   */
  import { XMark } from "svelte-heros-v2";
  import { Html5Qrcode } from "html5-qrcode";
  import { onMount } from "svelte";

  let {
    onClose = () => {},
    onScan = (_decoded: string) => {},
  }: {
    onClose: () => void;
    onScan: (decoded: string) => void;
  } = $props();

  let html5Qrcode: Promise<Html5Qrcode | undefined>;

  function qrboxFunction(viewfinderWidth: number, viewfinderHeight: number) {
    const qrboxSize = Math.floor(
      Math.min(viewfinderWidth, viewfinderHeight) * 0.9
    );
    return {
      width: qrboxSize,
      height: qrboxSize,
    };
  }

  async function onScanSuccess(decodedText: string) {
    onScan(decodedText);
    onClose();
  }

  onMount(() => {
    html5Qrcode = (async () => {
      try {
        const scanner = new Html5Qrcode("barcodeScanner");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: qrboxFunction },
          onScanSuccess,
          undefined
        );
        return scanner;
      } catch (err) {
        console.error(`Failed to start the scanner: ${err}`);
      }
    })();

    return () => {
      (async () => {
        try {
          const scanner = await html5Qrcode;
          await scanner?.stop();
        } catch (err) {
          console.error(`Error stopping the scanner: ${err}`);
        }
      })();
    };
  });
</script>

<div
  class="fixed top-0 left-0 w-full h-full bg-tilbot-secondary-purple z-50 flex flex-col justify-center text-white"
>
  <button
    class="btn btn-circle absolute right-4 top-4 z-10 bg-white text-tilbot-secondary-purple hover:bg-white"
    aria-label="Close scanner"
    onclick={onClose}
  >
    <XMark class="h-6 w-6" />
  </button>
  <div id="barcodeScanner" class="!border-0 z-0"></div>
</div>
