<div class="bg-gray-100 w-full top-0 h-20 drop-shadow-md fixed">
    <div class="avatar online placeholder mt-4 ml-4">
        <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
          <span>TB</span>
        </div>
    </div> 
    <span class="text-lg font-medium ml-4">Tilbot</span>
</div>

<div class="top-20 w-full bottom-20 fixed overflow-y-scroll py-2" bind:this={messages}>

</div>


<div class="bg-gray-100 w-full h-20 drop-shadow-md absolute bottom-0">
    <textarea class="textarea textarea-bordered resize-none inset-y-2 left-4 right-20 absolute" placeholder="" bind:this={input_text}></textarea>
    <button class="btn btn-circle absolute bottom-4 right-4" on:click={user_message}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>          
    </button>
</div>

<script lang="ts">
import { onMount } from "svelte";
import { LocalProjectController} from "../client/controllers/localproject";

let messages: HTMLElement;
let input_text: HTMLTextAreaElement;
let controller: LocalProjectController;

onMount(() => {
    if (document.referrer == '') {
        // @TODO load a temp local file here to display to users connecting
    }    

    window.addEventListener('message', project_received, false);
});

function project_received(event: MessageEvent) {
    messages.innerHTML = '';

    // Clear all ongoing timers (https://stackoverflow.com/questions/3847121/how-can-i-disable-all-settimeout-events)
    // Set a fake timeout to get the highest timeout id
    var highestTimeoutId = setTimeout(";");
    for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i);
    }

    controller = new LocalProjectController(event.data, chatbot_message);
}

function chatbot_message(msg: any) {
      // Send the message
      //this.typingIndicator.show();

      // @TODO: make typing indicator optional
      setTimeout(function() {
        //self.typingIndicator.hide();
        show_message(msg.type, msg.content, msg.params);
        controller.message_sent_event();
      }, msg.content.length / 15 * 1000);    
}

function user_message() {
    // @TODO: empty input field
    let chat = document.createElement('div');
    chat.setAttribute('class', 'chat chat-end');
    let chat_bubble = document.createElement('div');
    chat_bubble.setAttribute('class', 'chat-bubble chat-bubble-secondary');
    chat_bubble.textContent = input_text.value;
    chat.appendChild(chat_bubble);
    messages.appendChild(chat);
    setTimeout(function() { messages.scrollTop = messages.scrollHeight; }, 10);
}

function show_message(type: string, content: string, params: any) {
    let chat = document.createElement('div');
    chat.setAttribute('class', 'chat chat-start');
    let chat_bubble = document.createElement('div');
    chat_bubble.setAttribute('class', 'chat-bubble');
    chat_bubble.textContent = content;
    chat.appendChild(chat_bubble);
    messages.appendChild(chat);
    setTimeout(function() { messages.scrollTop = messages.scrollHeight; }, 10);    

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