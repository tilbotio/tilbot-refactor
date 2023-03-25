<div class="bg-gray-100 w-full top-0 h-20 drop-shadow fixed">
    <div class="avatar online placeholder mt-4 ml-4">
        <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
          <span>TB</span>
        </div>
    </div> 
    <span class="text-lg font-medium ml-4">Tilbot</span>
</div>

<div class="top-20 w-full bottom-20 fixed overflow-y-scroll py-2" bind:this={message_container}>
  {#each messages as message}
  {#if message.from == 'bot'}
  <div class="chat chat-start">
    <div class="chat-bubble bg-tilbot-secondary-purple">
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
<div class="bg-gray-100 w-full drop-shadow-md absolute bottom-0">
  <div class="p-3 mr-16 text-center">
  {#each mc_options as mc_option}
    {#if mc_option.selected}
    <button class="btn m-1" on:click={mc_submit}>{mc_option.content}</button>
    {:else}
    <button class="btn btn-outline m-1" on:click={mc_select}>{mc_option.content}</button>
    {/if}
  {/each}
  </div>
  <button class="btn btn-circle absolute bottom-4 right-4" on:click={mc_submit}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>          
  </button>
</div>

{:else}
<div class="bg-gray-100 w-full h-20 drop-shadow-md absolute bottom-0">
    <textarea class="textarea textarea-bordered resize-none inset-y-2 left-4 right-20 absolute" placeholder="" bind:this={input_text} on:keydown={input_key_down}></textarea>
    <button class="btn btn-circle absolute bottom-4 right-4" on:click={text_submit}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>          
    </button>
</div>
{/if}

{#if !iframe}
<script src="/socket.io/socket.io.js" on:load="{socket_script_loaded}"></script>
{/if}

<script lang="ts">
import { onMount } from "svelte";
import { LocalProjectController} from "../client/controllers/localproject";

let message_container: HTMLElement;
let input_text: HTMLTextAreaElement;
let controller: LocalProjectController;

let messages: Array<any> = [];
let current_message_type: string = 'Auto';
let mc_options: Array<any> = [];
let show_typing_indicator: boolean = false;
let iframe = true;

onMount(() => {
    if (window.self === window.top) {
      iframe = false;
      //let socket = io();
    }

    if (document.referrer == '') {
        // @TODO load a temp local file here to display to users connecting
    }    

    window.addEventListener('message', project_received, false);
});

function socket_script_loaded(event: Event) {
  let socket = io();
  import("../client/controllers/remoteproject").then(function(m: any) {
    controller = new m.RemoteProjectController(socket, chatbot_message)  
  });
  
}

function project_received(event: MessageEvent) {
    messages = [];

    // Clear all ongoing timers (https://stackoverflow.com/questions/3847121/how-can-i-disable-all-settimeout-events)
    // Set a fake timeout to get the highest timeout id
    var highestTimeoutId = setTimeout(";");
    for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i);
    }

    controller = new LocalProjectController(event.data, chatbot_message);
}

function chatbot_message(msg: any) {
    console.log(msg);
      // Send the message
      show_typing_indicator = true;

      setTimeout(function() {
        show_typing_indicator = false;
        show_message(msg.type, msg.content, msg.params);
        controller.message_sent_event();
      }, msg.content.length / 15 * 500);    
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

function text_submit() {
    user_message(input_text.value.replace(/(?:\r\n|\r|\n)/g, '<br>'));
}

function mc_select(event: MouseEvent) {
  if (event.target !== null) {
    let tar = event.target as HTMLElement;
    mc_options.forEach(function(value) {
      if (value.content == tar.innerHTML) {
        value.selected = true;
      }
      else {
        value.selected = false;
      }
    });

    mc_options = mc_options;
  }
}

function mc_submit() {
  mc_options.forEach(function(value) {
    if (value.selected) {
      user_message(value.content);
      current_message_type = 'Text';
      return;
    }
  });
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

function show_message(type: string, content: string, params: any) {
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