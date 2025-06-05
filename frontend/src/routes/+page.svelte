<div class="fixed top-0 left-0 w-full h-full bg-tilbot-secondary-purple z-50 hidden flex flex-col justify-center text-white" bind:this={scan_overlay}>
  <button class="btn btn-circle absolute right-4 top-4 z-10 bg-white text-tilbot-secondary-purple hover:bg-white" on:click={close_scan_overlay}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>
  <div id="barcodereader" class="!border-0 z-0">

  </div>
</div>

<ChatHeader
  show={show_header}
  settings={settings}
  {path}
/>

<script lang="ts">
import ChatHeader from "$lib/components/ChatHeader.svelte";
import { onMount, tick } from "svelte";
import { page } from '$app/stores';
import { BasicProjectController} from "../shared/controllers/basicproject";
import { LocalProjectController} from "../client/controllers/localproject";
import { RemoteProjectController} from "../client/controllers/remoteproject";
import { Html5Qrcode } from "html5-qrcode";

let message_container: HTMLElement;
let show_header: boolean = true;

// For the barcode scanner
let scan_overlay: HTMLElement;
let html5Qrcode: any = undefined;

let input_text: HTMLTextAreaElement;
let controller: BasicProjectController;

let messages: Array<any> = [];
let current_message_type: string = 'Auto';
let mc_options: Array<any> = [];
let show_typing_indicator: boolean = false;
let isTilbotEditor = true;
let conversation_id: string | null = null;
let participant_id: string | null = '';

let path: string = '';
let projectId: string = '';

let settings: any = {
                'typing_style': 'fixed',
                'typing_time': 2,
                'typing_charpsec': 40,
                'show_avatar': 'yes',
                'avatar_file': '',
                'name': 'Tilbot'
};

onMount(async () => {
    // Check if we're in the editor
    try {
      if (window.parent.isTilbotEditor === undefined) {
        console.log('not Tilbot editor');
        isTilbotEditor = false;
      }
    }
    catch {
      console.log('not Tilbot editor --- catch');
      isTilbotEditor = false;
    }

    if (document.referrer == '') {
        // @TODO load a temp local file here to display to users connecting
    }

    window.addEventListener('message', message_received, false);

    //window.api.send('get-settings');

    const url = $page.url;

    if (url.searchParams.get('show_header') !== null && url.searchParams.get('show_header') != '') {
      if (url.searchParams.get('show_header') == '1') {
        show_header = true;
      }
      else {
        show_header = false;
      }
    }

    if (url.searchParams.get('pid') !== null && url.searchParams.get('pid') != '') {
      participant_id = url.searchParams.get('pid');
    }

    if (url.searchParams.get('project') !== null && url.searchParams.get('project') != '') {
      // cast to string to avoid type errors
      projectId = url.searchParams.get('project') as string;
      path = `/proj_pub/${projectId}/`;
      try {
        const response = await fetch(
          `/api/create_conversation?id=${encodeURIComponent(projectId)}`
        );
        ({ conversation: conversation_id, settings } = await response.json());
        console.log(settings)
      } catch(err) {
        console.log(err);
      }

      const remoteController = new RemoteProjectController(chatbot_message, chatbot_settings, set_typing_indicator);
      controller = remoteController;

      if (participant_id != null && participant_id !== '') {
          remoteController.set_participant_id(participant_id);
      }

      create_websocket();
    }

});

function firstletter(str: string) {
  return str.charAt(0).toUpperCase();
}

function create_websocket() {
  let restarting = false;
  let socket: WebSocket | null = null;

  function restart() {
    if (!restarting) {
      restarting = true;
      setTimeout(create_websocket, 1000);
    }
    if (socket) {
      socket.close();
      socket = null;
    }
  }

  if (!conversation_id) {
    restart();
    return;
  }

  if (!(controller instanceof RemoteProjectController)) {
    restart();
    return;
  }

  const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const url = `${proto}${window.location.host}/ws/chat?conversation=${encodeURIComponent(conversation_id)}`;

  socket = new WebSocket(url);
  controller.socket = socket;

  socket.addEventListener('close', restart);
  socket.addEventListener('error', restart);
}

async function message_received(event: MessageEvent) {
  // A message could either be a project file (simulator) or a text message from a parent window.
  if (event.data.project !== undefined) {
    project_received(event.data);
  }
  else {
    if (event.data.startsWith('log:')) {
      controller.log(event.data.substring(5));
    }
    else if (event.data.startsWith('chatgpt|')) {
      chatgpt_message(event.data.substring(8));
    }
    else if (event.data.startsWith('variation|')) {
      variation_message(event.data.substring(10));

    }
    else {
      current_message_type = 'Text';
      await tick();
      input_text.value = event.data;

      try {
        text_submit();
      }
      finally {
        input_text.value = '';
      }
    }
  }
}

function project_received(data: any) {
    messages = [];
    current_message_type = 'Auto';
    path = data.path;

    // Clear all ongoing timers (https://stackoverflow.com/questions/3847121/how-can-i-disable-all-settimeout-events)
    // Set a fake timeout to get the highest timeout id
    var highestTimeoutId = setTimeout(";");
    for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i);
    }

    controller = new LocalProjectController(data.project, chatbot_message, chatbot_settings, variation_request);

    let windowmsg = {
          msg: "reset_var_mem"
    }

    window.parent.postMessage(windowmsg);
}

function set_typing_indicator() {
  show_typing_indicator = true;
}

function chatbot_settings(s: any, p: string = '') {
    if (s.show_avatar === undefined) {
      s.show_avatar = 'yes';
    }
    if (s.name === undefined) {
      s.name = 'Tilbot';
    }
    if (s.avatar_file === undefined) {
      s.avatar_file = '';
    }

    if (p !== '') {
      path = p;
    }

    settings = s;
}

function chatbot_message(msg: any) {
      console.log(msg);

      // Send the message
      show_typing_indicator = true;
      setTimeout(function() { message_container.scrollTop = message_container.scrollHeight; }, 10);

      let timeout = 2000;

      if (settings.typing_style !== undefined && settings.typing_style == 'variable') {
        timeout = msg.content.length / settings.typing_charpsec * 1000;
      }
      else if (settings.typing_style !== undefined && settings.typing_style == 'fixed') {
        timeout = settings.typing_time * 1000;
      }

      setTimeout(function() {
        show_typing_indicator = false;

        if (msg.has_targets === undefined) {
          msg.has_targets = true;
        }

        show_message(msg.type, msg.content, msg.params, msg.has_targets);
        controller.message_sent_event();
      }, timeout);
}

function input_key_down(event: KeyboardEvent) {
  if (event.key == "Enter" && !event.shiftKey) {
    try {
      text_submit();
    }
    finally {
      event.preventDefault();
      input_text.value = '';
    }
  }
}

function input_key_up(event: KeyboardEvent) {
  // Refresh the value to trigger buttons to show/hide if needed
  input_text.value = input_text.value;
}

async function close_scan_overlay() {
  try {
    await html5Qrcode.stop();
  } finally {
    scan_overlay.classList.add('hidden');
  }
}

function qrboxFunction(viewfinderWidth: number, viewfinderHeight: number) {
  let minEdgePercentage = 0.9; // 70%
  let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
  let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
  return {
      width: qrboxSize,
      height: qrboxSize
  };
}

function start_barcode() {
  html5Qrcode = new Html5Qrcode("barcodereader");

  scan_overlay.classList.remove('hidden');

  html5Qrcode.start({
    facingMode: 'environment'
  },
  {
    fps: 10,
    qrbox: qrboxFunction
  },
  onScanSuccess);

  //html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

async function onScanSuccess(decodedText: string, decodedResult: any) {
  input_text.value = 'barcode:' + decodedText;
  try {
    text_submit();
  }
  finally {
    input_text.value = '';
    try {
      await html5Qrcode.stop();
    } finally {
      message_container.dispatchEvent(new Event('mousedown'));
      scan_overlay.classList.add('hidden');
    }
  }
}

function text_submit_button() {
  try {
    text_submit();
  }
  finally {
    input_text.value = '';
  }
}

function text_submit() {
    user_message(input_text.value.replace(/(?:\r\n|\r|\n)/g, '<br>'));
}

function mc_submit(event: MouseEvent) {

  if (event.target !== null) {
    let tar = event.target as HTMLElement;
    mc_options.forEach(function(value) {
      if (value.content == tar.innerHTML) {
        user_message(value.content);
        current_message_type = 'Text';
        return;
      }
    });
  }

}

function user_message(content: string) {
    if (content == '') {
      return;
    }

    messages.push({from: 'user', content: content});
    messages = messages;

    setTimeout(function() { message_container.scrollTop = message_container.scrollHeight; }, 10);

    controller.receive_message(content);
}

function chatgpt_message(content: string) {
    if (content == '') {
      return;
    }

    messages.push({from: 'chatgpt', content: content});
    messages = messages;

    setTimeout(function() { message_container.scrollTop = message_container.scrollHeight; }, 10);

    controller.receive_message(content);
}

function variation_request(content: string, prompt:string, memory:boolean) {
    show_typing_indicator = true;

    let windowmsg = {
          msg: "variation",
          content: content,
          prompt: prompt,
          memory: memory
    }

    window.parent.postMessage(windowmsg);
}

function variation_message(content: string) {
    // @TODO: check for invalid message
    controller.receive_variation(content);
}

function show_message(type: string, content: string, params: any, has_targets: boolean) {

    if (isTilbotEditor) {
      let gpttype = type;

      if (!has_targets) {
        gpttype = 'Text';
      }

      let c = content.replace(/<br\s*[\/]?>/gi, "\r\n").replace(/<\/?[^>]+(>|$)/g, "");

      if (type == 'MC') {
        c += "\r\n\r\n" + '{' + params.options.join(';') + '}';
      }

      let windowmsg = {
        msg: "chatgptsim",
        type: gpttype,
        content: c
      }

      window.parent.postMessage(windowmsg);
    }

    messages.push({from: 'bot', content: content});
    messages = messages;
    setTimeout(function() { message_container.scrollTop = message_container.scrollHeight; }, 10);

    current_message_type = type;
    mc_options = [];
    if (type == 'MC') {
      params.options.forEach(function(value: string) {
        mc_options.push({content: value, selected: false});
      });
      mc_options = mc_options;
    }
      //this.current_type = type;
      //this.current_params = params;

      //new TextServerController({ msg: content, background_color: this.background_client});
      //setTimeout(function() { $("body").scrollTop($("body")[0].scrollHeight); }, 10);


      //this.hide_all_inputs();

      // Set the right input modality
      /*if (type == 'MC') {
        console.log(params.options);
        this.inputMC.redraw(params.options);
        this.inputMC.show();
      }
      else if (type == 'List') {
        console.log(params.options);
        this.inputList.redraw(params);
        this.inputList.show();
      }
      else {
        $('#input_field').show();
      } */
}


</script>
