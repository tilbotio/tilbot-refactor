import {BasicProjectController} from '../../shared/controllers/basicproject';

class LocalProjectController extends BasicProjectController {

    private current_block_id: number;
    private chatbot_message_callback: Function;
    private chatbot_settings_callback: Function;
    private variation_request_callback: Function;
    private client_vars: any;

    constructor(json_str: string, chatbot_message_callback: Function, chatbot_settings_callback: Function, variation_request_callback: Function) {
        super();

        this.chatbot_message_callback = chatbot_message_callback;
        this.chatbot_settings_callback = chatbot_settings_callback;
        this.variation_request_callback = variation_request_callback;
        this.project = JSON.parse(json_str);
        this.current_block_id = this.project.starting_block_id;
        this.client_vars = {};

        if (this.project.settings === undefined) {
            this.project.settings = {
                'typing_style': 'fixed',
                'typing_time': 2,
                'typing_charpsec': 40,
                'show_avatar': 'yes',
                'name': 'Tilbot'
            }            
        }

        this.chatbot_settings_callback(this.project.settings);
        this.send_message(this.project.blocks[this.project.starting_block_id.toString()]);
    }

    async send_events(connector: any, input_str: string) {
        if (connector.events !== undefined) {
          for (let c = 0; c < connector.events.length; c++) {
            if (connector.events[c].type == 'message') {
                // Do nothing for now (simulator)  
            }
            else if (connector.events[c].type == 'variable') {
                let regExp = /\[([^\]]+)\]/g;
                let matches = regExp.exec(connector.events[c].var_value);
    
                if (matches !== null) {
                    // @TODO: support more elaborate DB look-ups, now hard-coded to do random line
                    if (matches[1].toLowerCase().startsWith('random')) {
                        let db = matches[1].substring(7, matches[1].indexOf(')'));
                        let res = await window.parent.api.invoke('query-db-random', {db: db});
                        if (res !== null) {
                            this.client_vars[connector.events[c].var_name] = res;
                        }
                    }
                    else if (matches[1] == 'input') {
                        this.client_vars[connector.events[c].var_name] = connector.events[c].var_value.replace('[input]', input_str);
                    }
                }
                else {
                    this.client_vars[connector.events[c].var_name] = connector.events[c].var_value;
                }
            }
          }
        }
      }    

    send_message(block: any, input: string = '') {
        let params: any = {};

        let content = this.check_variables(block.content, input);

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
            let targets = true;

            if (block.connectors[0].targets.length == 0) {
                targets = false;
            }

            this.chatbot_message_callback({type: block.type, content: content, params: params, has_targets: targets});
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

        if (block.chatgpt_variation !== undefined && block.chatgpt_variation) {
            let content = this.check_variables(block.content, input);   
            let prompt = this.check_variables(block.variation_prompt);

            this.variation_request_callback(content, prompt, block.chatgpt_memory);
        }
        else {
            setTimeout(function() {
                self.send_message(block, input);
            }, block.delay * 1000);    
        }

    }

    check_variables(content: string, input: string = '') {

        let regExp = /\[([^\]]+)\]/g;
        let matches = regExp.exec(content);

        if (matches !== null) {
          if (typeof input === 'object' && input !== null) {
            content = content.substring(0, matches.index) + input[matches[1]] + content.substring(matches.index + matches[1].length + 2);
          }
          else if (input !== '' && content.includes('[input]')) {
            content = content.replace('[input]', input);
          }  
          else {
            // If it's a column from a CSV table, there should be a period.
            // Element 1 of the match contains the string without the brackets.
            let csv_parts = matches[1].split('.');

            if (csv_parts.length == 2) {
                let db = csv_parts[0];
                let col = csv_parts[1];

                // The column can be yet another variable
                if (col.startsWith('[')) {
                    col = this.client_vars[col.substring(1)];
                    matches[1] += ']';
                }

                // Check if local variable
                if (db in this.client_vars) {
                    content = content.replace('[' + matches[1] + ']', this.client_vars[db][col]);
                }
            }
            else {
                content = content.replace('[' + matches[1] + ']', this.client_vars[matches[1]]);
            }
          }
        }  

        return content;
    }

    async check_labeled_connector(connector: string, str: string) : Promise<any> {
        // Check for tags / special commands
        let regExp = /\[([^\]]+)\]/g;
        let matches = regExp.exec(connector);

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

                // Check if local variable
                if (db in this.client_vars) {
                    let var_options = this.client_vars[db][col].split('|');
                    
                    for (var o in var_options) {
                        let opt = var_options[o].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        if (str.match(new RegExp("\\b"+opt+"\\b", "i")) != null && should_match) {                    
                            return var_options[o];
                        }
                    }

                    if (!should_match) {
                        return '';
                    }
                }
                else {
                    let parts = str.split(' ');

                    for (let part in parts) {

                        let res = await window.parent.api.invoke('query-db', {db: db, col: col, val: parts[part].replace('barcode:', '').replace('?', '').replace('!', '').replace('.', '')});
                    
                        if (res.length > 0 && should_match) {
                            return parts[part].replace('barcode:', '').replace('?', '').replace('!', '').replace('.', '');
                        }
                        else if (res.length == 0 && !should_match) {
                            return parts[part].replace('barcode:', '').replace('?', '').replace('!', '').replace('.', '');
                        }
                    }
                }
            }
        }

        else {
            let candidate = connector.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if (str.replace('barcode:', '').toLowerCase().match(new RegExp("\\b"+candidate+"\\b", "i")) != null) {
                return str;
            }                    
        }

        return null;
    }

    receive_variation(str: string) {
        // @TODO: handle error messages in requesting variation from ChatGPT
        var self = this;
        var path = this.get_path();
        var block = this.project;

        if (path.length > 0) {
            block = this.project.blocks[path[0]];

            for (var i = 1; i < path.length; i++) {
                block = block.blocks[path[i]];
            }
        }       
        
        block = JSON.parse(JSON.stringify(block.blocks[this.current_block_id.toString()]));
        block.content = str;

        setTimeout(function() {
            self.send_message(block);
        }, block.delay * 1000);    
    }

    async receive_message(str: string) {
        let found = false;
        let else_connector_id = '-1';

        if (this.current_block_id !== undefined) {
            var block = this.project.blocks[this.current_block_id.toString()];

            // @TODO: improve processing of message
            if (block.type == 'MC') {
                for (var c in block.connectors) {
                    if (block.connectors[c].label == str) {
                        if (block.connectors[c].targets.length > 0) {
                            found = true;
                            this.current_block_id = block.connectors[c].targets[0];
                            this.send_events(block.connectors[c], str);
                            this._send_current_message(str);
                        }
                    }
                }
            }
            else if (block.type == 'Text' || block.type == 'List') {
                for (var c in block.connectors) {
                    if (block.connectors[c].label == '[else]') {
                        else_connector_id = c;
                    }

                    else if ((block.connectors[c].method == 'barcode' && str.startsWith('barcode:')) || block.connectors[c].method !== 'barcode') {
                        // @TODO: distinguish between contains / exact match options                       
                        let ands = block.connectors[c].label.split(' [and] ');
                        let num_match = 0;
                        let last_found_output = null;

                        for (let and in ands) {
                            //for (let part in parts) {
                                let output = await this.check_labeled_connector(ands[and], str);
                                if (output !== null) {
                                    num_match += 1;
                                    last_found_output = output;
                                }
                            //}
                        }

                        if (num_match == ands.length) {
                            this.current_block_id = block.connectors[c].targets[0];
                            this.send_events(block.connectors[c], last_found_output);
                            this._send_current_message(last_found_output);                
                            break;
                        }                            
                    }
                }
            }            
        }

        if (!found) {
            let else_connector = null;
            // Check if we need to fire a trigger -- after checking responses to query by the bot!
            for (var b in this.project.blocks) {
                if (this.project.blocks[b].type == 'Trigger') {
                    for (var c in this.project.blocks[b].connectors) {
                        if (this.project.blocks[b].connectors[c].label == '[else]') {
                            else_connector = this.project.blocks[b].connectors[c];
                        }

                        else if ((this.project.blocks[b].connectors[c].method == 'barcode' && str.startsWith('barcode:')) || this.project.blocks[b].connectors[c].method !== 'barcode') {
                            // @TODO: distinguish between contains / exact match options
                            //let parts = str.split(' ');
                            let ands = this.project.blocks[b].connectors[c].label.split(' [and] ');
                            let num_match = 0;
                            let last_found_output = null;

                            for (let and in ands) {
                                //for (let part in parts) {
                                    let output = await this.check_labeled_connector(ands[and], str);//parts[part].replace('?', ''));

                                    if (output !== null) {
                                        num_match += 1;
                                        last_found_output = output;
                                    }
                                //}
                            }

                            if (num_match == ands.length) {
                                found = true;
                                this.current_block_id = this.project.blocks[b].connectors[c].targets[0];
                                this.send_events(this.project.blocks[b].connectors[c], last_found_output);
                                this._send_current_message(last_found_output);                
                                break;
                            }                            
                        }
                    }                
                }
            }

            if (else_connector !== null) {
                found = true;
                this.current_block_id = else_connector.targets[0];
                this.send_events(else_connector, '');
                this._send_current_message('');                
            }
        }

        if (!found && else_connector_id !== '-1') {
            found = true;
            this.current_block_id = block.connectors[else_connector_id].targets[0];
            this.send_events(block.connectors[else_connector_id], str);
            this._send_current_message(str);
        }        
    }

}
  

export {LocalProjectController};