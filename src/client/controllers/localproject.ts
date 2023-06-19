import {BasicProjectController} from '../../shared/controllers/basicproject';

class LocalProjectController extends BasicProjectController {

    private current_block_id: number;
    private chatbot_message_callback: Function;

    constructor(json_str: string, chatbot_message_callback: Function) {
        super();

        this.chatbot_message_callback = chatbot_message_callback;
        this.project = JSON.parse(json_str);
        this.current_block_id = this.project.starting_block_id;

        this.send_message(this.project.blocks[this.project.starting_block_id.toString()]);
    }

    send_message(block: any, input: string = '') {
        let params: any = {};

        let content = block.content;

        let regExp = /\[([^\]]+)\]/g;
        let matches = regExp.exec(content);
  
        if (matches !== null) {
          if (typeof input === 'object' && input !== null) {
            content = content.substring(0, matches.index) + input[matches[1]] + content.substring(matches.index + matches[1].length + 2);
          }
          else if (input !== null) {
            content = content.replace('[input]', input);
          }  
        }  

        if (block.type == 'MC') {
            params.options = [];
            for (var c in block.connectors) {
                params.options.push(block.connectors[c].label);
            }

            this.chatbot_message_callback({type: block.type, content: content, params: params});
        }
        else if (block.type == 'List') {
            params.options = block.items;
            params.text_input = block.text_input;
            params.number_input = block.number_input;

            this.chatbot_message_callback({type: block.type, content: content, params: params});
        }
        else if (block.type == 'Group') {
            this.move_to_group({id: this.current_block_id, model: block});
            this.current_block_id = block.starting_block_id;
            this.send_message(block.blocks[block.starting_block_id]);
        }
        else {
            this.chatbot_message_callback({type: block.type, content: content, params: params});
        }
    }

    check_group_exit(id: number) {
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

    _send_current_message(input:string = '') {
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
            self.send_message(block, input);
        }, block.delay * 1000);
    }

    async check_labeled_connector(connector: any, str: string) : Promise<boolean> {
        let found = false;

        if (connector.method !== undefined && (connector.method !== 'barcode' || str.startsWith('barcode:'))) {
            // Check for tags / special commands
            let regExp = /\[([^\]]+)\]/g;
            let matches = regExp.exec(connector.label);

            if (matches !== null) {
              let should_match = true;
              // @TODO: do something in case of multiple matches, and support [and] or [or]
              //let match = matches[0];

              // If it's a column from a CSV table, there should be a period.
              // Element 1 of the match contains the string without the brackets.
              let csv_parts = matches[1].split('.');

              if (csv_parts.length == 2) {
                let db = csv_parts[0];
                let col = csv_parts[1];

                if (db.startsWith('!')) {
                  should_match = false;
                  db = db.substring(1);
                }

                //let res = await this.csv_datas[db].get(col, str.replace('barcode:', ''));
                // Check if we're in Electron
                // @TODO: if not, query the socket for the db
                let res = await window.parent.api.invoke('query-db', {db: db, col: col, val: str.replace('barcode:', '')});
              
                if (res.length > 0 && should_match) {
                  found = true;
                  this.current_block_id = connector.targets[0];
                  this._send_current_message(res[0]);
                }
                else if (res.length == 0 && !should_match) {
                  found = true;
                  this.current_block_id = connector.targets[0];
                  this._send_current_message();
                }
              }
            }

            else {
              if (str.replace('barcode:', '').toLowerCase().includes(connector.label.toLowerCase())) {
                found = true;
                this.current_block_id = connector.targets[0];
                this._send_current_message(str);
              }                  
            }            
        }                
        else if (str.toLowerCase().includes(connector.label.toLowerCase())) {
            found = true;
            this.current_block_id = connector.targets[0];
            this._send_current_message(str);
        }

        return found;
    }

    async receive_message(str: string) {
        // Check if we need to fire a trigger -- prioritize these over continuing the flow of the interaction?
        for (var b in this.project.blocks) {
            if (this.project.blocks[b].type == 'Trigger') {
                for (var c in this.project.blocks[b].connectors) {
                    if (await this.check_labeled_connector(this.project.blocks[b].connectors[c], str)) {
                        break;
                    }
                }                
            }
        }

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
            let found = false;
            let else_connector_id = '-1';

            for (var c in block.connectors) {
                if (block.connectors[c].label == '[else]') {
                    else_connector_id = c;
                }

                else {
                    found = await this.check_labeled_connector(block.connectors[c], str);                    
                    if (found) {
                        break;
                    }
                }
            }

            if (!found && else_connector_id !== '-1') {
                this.current_block_id = block.connectors[else_connector_id].targets[0];
                this._send_current_message(str);
            }
        }
    }

}
  

export {LocalProjectController};