const CsvData = require('./csvdata.cjs');
const ChatGPT = require('./chatgpt.cjs');

class ProjectController {
    constructor(io, project, socket_id, p) {
        this.io = io;
        this.project = project;
        this.socket_id = socket_id;
        this.current_block_id = this.project.starting_block_id;
        this.logger = undefined;

        if (process.versions.hasOwnProperty('electron')) {
          let Logger = require('./logger.cjs');
          this.logger = new Logger(p);
          this._send_current_message();        
        }
        else {
          import('../clientsocket/logger.js').then((mod) => {
            this.logger = new mod.Logger(project.id);
            this._send_current_message();        
          });
        }        

        this.client_vars = {};
        
        this.csv_datas = {};

        this.chatgpt_var_mem = undefined;

        // Set up the data files
        for (let v in this.project.variables) {
          if (this.project.variables[v].type == 'csv') {
            this.csv_datas[this.project.variables[v].name] = new CsvData(this.project.variables[v].csvfile, p + '/currentproject/');
          }
        }


        if (this.project.settings === undefined) {
            this.project.settings = {
              'typing_style': 'fixed',
              'typing_time': 2,
              'typing_charpsec': 40,
              'show_avatar': 'yes',
              'avatar_file': '',
              'name': 'Tilbot'              
            }            
        }
                
        this.io.to(this.socket_id).emit('settings', this.project.settings);

    }

    get_path() {
      var path = [];

      for (var b in this.selected_group_blocks) {
        path.push(this.selected_group_blocks[b].id);
      }

      return path;
    }
    
    async _send_current_message(input = '') {
        if (this.current_block_id == undefined) {
          return;
        }

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

          // Send a typing indicator enabling message to the client
          this.io.to(this.socket_id).emit('typing indicator');

          let resp = await ChatGPT.get_variation(content, prompt, block.chatgpt_memory, this.chatgpt_var_mem);
          this.chatgpt_var_mem = resp[0];
          resp = resp[1];
          
          let block_copy = JSON.parse(JSON.stringify(block));
          block_copy.content = resp;
  
          setTimeout(function() {
              self.send_message(block_copy);
          }, block_copy.delay * 1000);             
        }
        else {
          setTimeout(function() {
              self.send_message(block, input);
          }, block.delay * 1000);    
        }  
    }    

    check_variables(content, input = '') {

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

    async send_events(connector, input_str) {
      if (connector.events !== undefined) {
        for (let c = 0; c < connector.events.length; c++) {
          if (connector.events[c].type == 'message') {

            if (typeof input_str == 'object') {
              // Check for tags / special commands
              let regExp = /\[([^\]]+)\]/g;
              let matches = regExp.exec(connector.events[c].content);

              if (matches !== null) {
                // If it's a column from a CSV table, there should be a period.
                // Element 1 of the match contains the string without the brackets.
                let csv_parts = matches[1].split('.');

                if (csv_parts.length == 2) {
                  let db = csv_parts[0];
                  let col = csv_parts[1];

                  this.io.to(this.socket_id).emit('window message', {content: connector.events[c].content.replace('[' + db + '.' + col + ']', input_str[col])});
                }
              
              }
            }
            else {
              // Check for tags / special commands
              let regExp = /\[([^\]]+)\]/g;
              let matches = regExp.exec(connector.events[c].content);

              if (matches !== null) {
                // If it's a column from a CSV table, there should be a period.
                // Element 1 of the match contains the string without the brackets.
                let csv_parts = matches[1].split('.');

                if (csv_parts.length == 2) {
                  let db = csv_parts[0];
                  let col = csv_parts[1];

                  this.io.to(this.socket_id).emit('window message', {content: connector.events[c].content.replace('[' + matches[1] + ']', this.client_vars[db][col])});
                }
                else {
                  this.io.to(this.socket_id).emit('window message', {content: connector.events[c].content.replace('[input]', input_str)});
                }              
              }
              else {
                this.io.to(this.socket_id).emit('window message', {content: connector.events[c].content});
              }
            }

          }

          else if (connector.events[c].type == 'variable') {
            let regExp = /\[([^\]]+)\]/g;
            let matches = regExp.exec(connector.events[c].var_value);

            if (matches !== null) {
                // @TODO: support more elaborate DB look-ups, now hard-coded to do random line
                if (matches[1].toLowerCase().startsWith('random')) {
                    let db = matches[1].substring(7, matches[1].indexOf(')'));
                    let res = await this.csv_datas[db].get_random_line();
                   
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

    send_message(block, input = '') {
      this.message_processed = false;

      var params = {};

      let content = this.check_variables(block.content, input);

      if (block.type == 'MC') {
        params.options = [];

        console.log(block.connectors);
        for (var c in block.connectors) {
          params.options.push(block.connectors[c].label);
        }

        console.log(params);

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: content, params: params});
        this.logger.log('message_bot', block.content);
      }
      else if (block.type == 'List') {
        params.options = block.items;
        params.text_input = block.text_input;
        params.number_input = block.number_input;

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: content, params: params});
        this.logger.log('message_bot', block.content);
      }
      else if (block.type == 'Group') {
          this.move_to_group({id: this.current_block_id, model: block});
          this.current_block_id = block.starting_block_id;
          this.send_message(block.blocks[block.starting_block_id]);
      }
      else if (block.type == 'AutoComplete') {
        params.options = block.options;

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: content, params: params});
        this.logger.log('message_bot', block.content);
      }
      else if (block.type == 'Auto') {
        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: content, params: params});          
        this.logger.log('message_bot', block.content);
      }
      else {
          this.io.to(this.socket_id).emit('bot message', {type: block.type, content: content, params: params});          
          this.logger.log('message_bot', block.content);  
      }        
    }

    message_sent_event() {
      var path = this.get_path();

      if (path.length == 0) {
          if (this.project.blocks[this.current_block_id.toString()].type == 'Auto' && this.project.blocks[this.current_block_id.toString()].connectors[0].targets.length > 0) {
              this.current_block_id = this.project.blocks[this.current_block_id.toString()].connectors[0].targets[0];
              this._send_current_message();
          }  
      }

      else {
          var block = this.project.blocks[path[0]];

          for (var i = 1; i < path.length; i++) {
              block = block.blocks[path[i]];
          }

          if (block.blocks[this.current_block_id.toString()].type == 'Auto' && block.blocks[this.current_block_id.toString()].connectors[0].targets.length > 0) {
              //var new_id = block.blocks[this.current_block_id.toString()].connectors[0].targets[0];
              //this.check_group_exit(new_id);
          }                  
      }      
    }   
    
    async check_labeled_connector(connector, str) {
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

                      let res = await this.csv_datas[db].get(col, parts[part].replace('barcode:', '').replace('?', '').replace('!', '').replace('.', ''));
                  
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
    
    async receive_message(str) {
      console.log('receive!' + str);

      let found = false;
      let else_connector_id = '-1';

      if (this.current_block_id !== undefined) {
        var block = this.project.blocks[this.current_block_id.toString()];
        this.logger.log('message_user', str);

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
                  let ands = this.project.blocks[b].connectors[c].label.split(' [and] ');
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
    
    disconnected() {
      this.logger.log('session_end');
    }

    log(str) {
      this.logger.log(str);
    }

    set_participant_id(pid) {
      this.logger.set_participant_id(pid);
    }
}

module.exports = ProjectController;