import {BasicProjectController} from '../../shared/controllers/basicproject';

class RemoteProjectController extends BasicProjectController {

    private chatbot_message_callback: Function;
    private chatbot_settings_callback: Function;
    private typing_indicator_callback: Function;
    private socket: any;

    constructor(socket: any, chatbot_message_callback: Function, chatbot_settings_callback: Function, typing_indicator_callback: Function) {
        super();

        this.chatbot_message_callback = chatbot_message_callback;
        this.chatbot_settings_callback = chatbot_settings_callback;
        this.typing_indicator_callback = typing_indicator_callback;
        this.socket = socket;
        socket.on('bot message', this.send_message.bind(this)); 
        socket.on('window message', this.window_message.bind(this));
        socket.on('settings', this.send_settings.bind(this));
        socket.on('typing indicator', this.send_typing_indicator.bind(this));
    }

    send_message(block: any) {
        this.chatbot_message_callback(block);
    }

    send_settings(settings: any, path: string) {
        this.chatbot_settings_callback(settings, path);
    }

    send_typing_indicator() {
        this.typing_indicator_callback();
    }

    window_message(msg: any) {
        if (window.self !== window.top) {
            window.parent.postMessage(msg.content);
        }
    }

    message_sent_event() {
        this.socket.emit('message sent');
    }

    receive_message(str: string) {
        this.socket.emit('user_message', str);
    }

    log(str: string) {
        this.socket.emit('log', str);
    }

    /*check_group_exit(id: number) {
        var path = this.get_path();

        if (id == -1) {            
            var group_block_id = path[path.length-1];
            this.move_level_up();            

            path = this.get_path();

            var block = this.project;

            if (path.length > 0) {
                for (var i = 0; i < path.length; i++) {
                    block = block.blocks[path[i]];
                }
            }

            for (var i = 0; i < block.blocks[group_block_id.toString()].connectors.length; i++) {
                if (block.blocks[group_block_id.toString()].connectors[i].from_id == this.current_block_id) {
                    var new_id = block.blocks[group_block_id.toString()].connectors[i].targets[0];
                    this.current_block_id = group_block_id;
                    this.check_group_exit(new_id);
                    break;
                }
            }
        }

        else {
            this.current_block_id = id;
            this._send_current_message();
        }
    }

    message_sent_event() {
        var path = this.get_path();

        if (path.length == 0) {
            if (this.project.blocks[this.current_block_id.toString()].type == 'Auto') {
                this.current_block_id = this.project.blocks[this.current_block_id.toString()].connectors[0].targets[0];
                this._send_current_message();
            }  
        }

        else {
            var block = this.project.blocks[path[0]];

            for (var i = 1; i < path.length; i++) {
                block = block.blocks[path[i]];
            }

            if (block.blocks[this.current_block_id.toString()].type == 'Auto') {
                var new_id = block.blocks[this.current_block_id.toString()].connectors[0].targets[0];
                this.check_group_exit(new_id);
            }                  
        }      
    }

    _send_current_message() {
        var self = this;
        var path = this.get_path();
        var block = this.project;

        if (path.length > 0) {
            block = this.project.blocks[path[0]];

            for (var i = 1; i < path.length; i++) {
            block = block.blocks[path[i]];
            }
        }       
        
        block = block.blocks[this.current_block_id.toString()];

        setTimeout(function() {
            self.send_message(block);
        }, block.delay * 1000);
    }

    receive_message(str: string) {
        var block = this.project.blocks[this.current_block_id.toString()];

        // @TODO: improve processing of message
        if (block.type == 'MC') {
            for (var c in block.connectors) {
                if (block.connectors[c].label == str) {
                    this.current_block_id = block.connectors[c].targets[0];
                    this._send_current_message();
                }
            }
        }
        else if (block.type == 'Text' || block.type == 'List') {
            for (var c in block.connectors) {
                if (block.connectors[c].label == str || block.connectors[c].label == '[else]') {
                    this.current_block_id = block.connectors[c].targets[0];
                    this._send_current_message();
                }
            }
        }
    }*/

}
  

export {RemoteProjectController};