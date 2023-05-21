const Logger = require('./logger.cjs');
const CsvData = require('./csvdata.cjs');

class ProjectController {
    constructor(io, project, socket_id) {
        this.io = io;
        this.project = project;
        this.socket_id = socket_id;
        this.current_block_id = this.project.starting_block_id;
        this.logger = new Logger();
        
        this.csv_datas = {};

        // Set up the data files
        for (let v in this.project.variables) {
          if (this.project.variables[v].type == 'csv') {
            this.csv_datas[this.project.variables[v].name] = new CsvData(this.project.variables[v].csvfile);
          }
        }

        this._send_current_message();
    }

    get_path() {
      var path = [];

      for (var b in this.selected_group_blocks) {
        path.push(this.selected_group_blocks[b].id);
      }

      return path;
    }
    
    _send_current_message(input = '') {
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
  
        setTimeout(function() {
          self.send_message(block, input);
        }, block.delay * 1000);  
  
    }    

    send_message(block, input = '') {
      this.message_processed = false;

      var params = {};

      let content = block.content;

      let regExp = /\[([^\]]+)\]/g;
      let matches = regExp.exec(content);

      if (matches !== null) {
        if (typeof input === 'object' && input !== null) {
          content = content.substring(0, matches.index) + input[matches[1]] + content.substring(matches.index + matches[1].length + 2);
        }
      }

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

            let res = await this.csv_datas[db].get(col, str.replace('barcode:', ''));
          
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
            this._send_current_message();
          }                  
        }            
      }     
      
      return found;
    }
    
    async receive_message(str) {
      console.log('receive!' + str);

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
      this.logger.log('message_user', str);

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
              this._send_current_message();
          }
      }      
    }
    
    disconnected() {
      this.logger.log('session_end');
    }
}

module.exports = ProjectController;