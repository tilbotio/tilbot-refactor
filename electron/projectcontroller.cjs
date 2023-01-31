class ProjectController {
    constructor(io, project, socket_id) {
        this.io = io;
        this.project = project;
        this.socket_id = socket_id;
        this.current_block_id = this.project.starting_block_id;

        // @TODO: logging

        this._send_current_message();
    }

    get_path() {
      var path = [];

      console.log(this.selected_group_blocks);

      for (var b in this.selected_group_blocks) {
        path.push(this.selected_group_blocks[b].id);
      }

      console.log(path);

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
        for (var c in block.connectors) {
          params.options.push(block.connectors[c].label);
        }

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        /*let msg = new MessageSchema();
        msg.message = block.content;
        msg.source = 'bot';
        this.log.messages.push(msg);
        this.log.save((err) => {
          if (err) {
            //console.log(err);
          }
        });*/
      }
      else if (block.type == 'List') {
        params.options = block.items;
        params.text_input = block.text_input;
        params.number_input = block.number_input;

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        /*let msg = new MessageSchema();
        msg.message = block.content;
        msg.source = 'bot';
        this.log.messages.push(msg);
        this.log.save((err) => {
          if (err) {
            //console.log(err);
          }
        });*/
      }
      else if (block.type == 'Group') {
          this.move_to_group({id: this.current_block_id, model: block});
          this.current_block_id = block.starting_block_id;
          this.send_message(block.blocks[block.starting_block_id]);
      }
      else if (block.type == 'AutoComplete') {
        params.options = block.options;

        this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        /*let msg = new MessageSchema();
        msg.message = block.content;
        msg.source = 'bot';
        this.log.messages.push(msg);
        this.log.save((err) => {
          if (err) {
            //console.log(err);
          }
        });  */        
      }
      else {
          this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
          /*let msg = new MessageSchema();
          msg.message = block.content;
          msg.source = 'bot';
          this.log.messages.push(msg);
          this.log.markModified('messages');
          this.log.save((err) => {
            if (err) {
              //console.log(err);
            }
          });*/
      }        
    }    
}

module.exports = ProjectController;