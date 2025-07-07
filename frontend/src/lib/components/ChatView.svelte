<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import BarcodeScanner from "./BarcodeScanner.svelte";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { getContext } from "svelte";

  const runtimeContext: RuntimeContext = getContext("runtimeContext");

  let showBarcodeScanner = $state(false);

  function closeBarcodeReader() {
    showBarcodeScanner = false;
  }

  function handleScannedCode(decoded: string) {
    // Bug with receive_message not defined on BasicProjectController, hence this intermediate debug fix
    // user_message(`barcode: ${decoded}`);
    console.log(`Code scanned: ${decoded}`);
  }
</script>

{#if showBarcodeScanner}
  <BarcodeScanner onClose={closeBarcodeReader} onScan={handleScannedCode} />
{/if}

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader />
  {/if}
</div>
