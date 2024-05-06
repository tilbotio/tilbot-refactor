<div class="fixed top-0 left-0 w-full h-full bg-tilbot-secondary-purple z-50 hidden flex flex-col justify-center text-white" bind:this={scan_overlay}>
  <button class="btn btn-circle absolute right-4 top-4 z-10 bg-white text-tilbot-secondary-purple hover:bg-white" on:click={close_scan_overlay}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>
  <div id="barcodereader" class="!border-0 z-0">
    
  </div>
</div>

<div class="flex flex-col w-full h-full">
<div class="bg-gray-100 w-full top-0 h-20 left-0 drop-shadow" bind:this={header}>
    {#if settings.show_avatar == 'yes'}
    <div class="avatar online placeholder mt-4 ml-4 w-12 float-left">
        {#if settings.avatar_file == ''}
        <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
          <span>{firstletter(settings.name)}</span>
        </div>
        {:else}
        <div class="rounded-full w-12">
          <img src="{path + settings.avatar_file}" />
        </div>
        {/if}
    </div> 
    {/if}
    <div class="text-lg font-medium mt-6 ml-4 float-left">{settings.name}</div>
</div>

<div class="w-full h-full flex-1 overflow-y-scroll py-2" bind:this={message_container}>
  {#each messages as message}
  {#if message.from == 'bot'}
  <div class="chat chat-start">
    <div class="chat-bubble bg-tilbot-secondary-purple">
      {@html message.content}
    </div>
  </div>
  {:else if message.from == 'chatgpt'}
  <div class="chat chat-end">
    <div class="chat-bubble chat-bubble-secondary bg-[#FFC500]">
      {@html message.content}
    </div>
  </div>
  {:else}
  <div class="chat chat-end">
    <div class="chat-bubble chat-bubble-secondary bg-tilbot-secondary-hardpink">
      {@html message.content}
    </div>
  </div>
  {/if}
  {/each}
  {#if show_typing_indicator}
  <div class="chat chat-start">
    <div class="chat-bubble bg-tilbot-secondary-purple">
      ...
    </div>
  </div>
  {/if}
</div>

{#if current_message_type == 'MC'}
<div class="bg-gray-100 w-full drop-shadow-md">
  <div class="p-3 mr-16 text-center">
  {#each mc_options as mc_option}
    <button class="btn btn-outline m-1" on:click={mc_submit}>{mc_option.content}</button>
  {/each}
  </div>
  <button class="btn btn-circle absolute bottom-4 right-4" on:click={mc_submit}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>          
  </button>
</div>

{:else}
<div class="bg-gray-100 w-full h-20 drop-shadow-md">
    <textarea class="relative top-2 h-16 textarea textarea-bordered resize-none inset-y-2 left-4 w-[calc(100%-5.5rem)]" placeholder="" bind:this={input_text} on:keydown={input_key_down} on:keyup={input_key_up}></textarea>
    <button class="btn btn-circle absolute bottom-4 right-4 {(input_text !== undefined && input_text !== null && input_text.value == '') ? 'hidden' : ''}" on:click={text_submit_button}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>          
    </button>
    <div id="menu" class="float-right z-10 {(input_text !== undefined && input_text !== null && input_text.value == '') ? '' : 'hidden'}">
      <ul class="menu menu-horizontal p-2 rounded-box ml-2 mt-2">
          <li>
            <a class="active:bg-tilbot-secondary-hardpink">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
              </svg>              
            </a>
            <ul class="bg-slate-100 shadow-md -top-full">
                <div class="tooltip tooltip-left" data-tip="Scan barcode">
                  <li>
                      <a class="active:bg-tilbot-secondary-hardpink" on:click={start_barcode}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                        </svg>                                                  
                      </a>
                  </li>
                </div>
            </ul>
          </li>
        </ul>
      </div>  
</div>
{/if}
</div>

{#if !iframe}
  {#if socket_addr !== null && socket_addr != ''}
  <script src="{socket_addr + '/socket.io/socket.io.js'}" on:load="{socket_script_loaded}"></script>
  {:else if socket_addr !== null && socket_addr == ''}
  <script src="/socket.io/socket.io.js" on:load="{socket_script_loaded}"></script>
  {/if}
{/if}

<script lang="ts">
import { onMount, tick } from "svelte";
import { page } from '$app/stores'; 
import { LocalProjectController} from "../client/controllers/localproject";
import { Html5Qrcode } from "html5-qrcode";

let message_container: HTMLElement;
let header: HTMLElement;

// For the barcode scanner
let scan_overlay: HTMLElement;
let html5Qrcode: any = undefined;

let input_text: HTMLTextAreaElement;
let controller: LocalProjectController;

let messages: Array<any> = [];
let current_message_type: string = 'Auto';
let mc_options: Array<any> = [];
let show_typing_indicator: boolean = false;
let iframe = true;
let isTilbotEditor = true;
let socket_addr = null;
let participant_id: string | null = '';

let path: string = null;

let settings: any = {
                'typing_style': 'fixed',
                'typing_time': 2,
                'typing_charpsec': 40,
                'show_avatar': 'yes',
                'avatar_file': '',
                'name': 'Tilbot'  
};

onMount(() => {
    // Check if we're in the editor
    try {
      if (window.self === window.top || window.parent.isTilbotEditor === undefined) {
        console.log('not Tilbot editor');
        isTilbotEditor = false;
        iframe = false;
        //let socket = io();
        }
    }
    catch {
      console.log('not Tilbot editor --- catch');
      isTilbotEditor = false;
      iframe = true;
    }

    if (document.referrer == '') {
        // @TODO load a temp local file here to display to users connecting
    }    

    window.addEventListener('message', message_received, false);

    //window.api.send('get-settings');

    const url = $page.url;

    if (url.searchParams.get('pid') !== null && url.searchParams.get('pid') != '') {
      participant_id = url.searchParams.get('pid');
    }

    if (url.searchParams.get('project') !== null && url.searchParams.get('project') != '') {

      path = '/proj_pub/' + url.searchParams.get('project') + '/';

      fetch(
        location.protocol + '//' + window.location.hostname + '/api/get_socket?id=' 
        + url.searchParams.get('project')
      )
      .then(response => {
          response.text().then(socket_id => {
              if(socket_id !== '-1') {
                socket_addr = url.protocol + '//' + url.hostname + ':' + socket_id;
                console.log(socket_addr);
              }
          })
          .catch(err => {
              console.log(err);
          });
      });

    }
    else {
      socket_addr = '';
    }
});

function firstletter(str: string) {
  return str.charAt(0).toUpperCase();
}

function socket_script_loaded(event: Event) {
  let socket = null;

  if (socket_addr !== '') {
    socket = io(socket_addr);
  }
  else {
    socket = io();
  }
  import("../client/controllers/remoteproject").then(function(m: any) {
    controller = new m.RemoteProjectController(socket, chatbot_message, chatbot_settings, set_typing_indicator);
    
    if (participant_id !== '') {
      // Add a delay because the socket needs time to set up.
      setTimeout(function() {
        controller.set_participant_id(participant_id);
      }, 2500);
    }
  });
  
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
    path = data.path + 'avatar/';

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

function close_scan_overlay() {
  try {
    html5Qrcode.stop().then((ignore) => {
    }).catch((err) => {
    });
  }
  finally {
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

function onScanSuccess(decodedText: string, decodedResult: any) {
  input_text.value = 'barcode:' + decodedText;
  try {
    text_submit();
  }
  finally {
    input_text.value = '';
    html5Qrcode.stop().then((ignore) => {
    }).catch((err) => {
    }).finally(() => {
      message_container.dispatchEvent(new Event('mousedown'));
      scan_overlay.classList.add('hidden');
    });
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