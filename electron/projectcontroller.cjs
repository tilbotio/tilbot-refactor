const Logger = require('./logger.cjs');

class ProjectController {
    constructor(io, project, socket_id) {
        this.io = io;
        this.project = project;
        this.socket_id = socket_id;
        this.current_block_id = this.project.starting_block_id;
        this.logger = new Logger();

        // @TODO: logging

        this._send_current_message();
    }

    get_path() {
      var path = [];

      for (var b in this.selected_group_blocks) {
        path.push(this.selected_group_blocks[b].id);
      }

      return path;
    }
    
    _send_current_message() {
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
          self.send_message(block);
        }, block.delay * 1000);  
  
    }    

    send_message(block) {
      this.message_processed = false;

      var params = {};

      if (block.type == 'MC') {
        params.options = [];

        console.log(block.connectors);
        for (var c in block.connectors) {
          params.options.push(block.connectors[c].label);
        }

        console.log(params);

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        this.logger.log('message_bot', block.content);
      }
      else if (block.type == 'List') {
        params.options = block.items;
        params.text_input = block.text_input;
        params.number_input = block.number_input;

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        this.logger.log('message_bot', block.content);
      }
      else if (block.type == 'Group') {
          this.move_to_group({id: this.current_block_id, model: block});
          this.current_block_id = block.starting_block_id;
          this.send_message(block.blocks[block.starting_block_id]);
      }
      else if (block.type == 'AutoComplete') {
        params.options = block.options;

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        this.logger.log('message_bot', block.content);
      }
      else if (block.type == 'Auto') {
        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});          
        this.logger.log('message_bot', block.content);
      }
      else {
          this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});          
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
    
    receive_message(str) {
      console.log('receive!' + str);

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
              else if (str.toLowerCase().includes(block.connectors[c].label.toLowerCase())) {
                  found = true;
                  this.current_block_id = block.connectors[c].targets[0];
                  this._send_current_message();
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