import { Schema } from 'mongoose';
  
let ProjectSchema = new Schema({
    id: {type: String, unique: true, required: true},
    name: {type: String, default: 'New project'},
    status: {type: Number, default: 0}, // 0 = paused, 1 = running
    current_block_id: {type: Number, default: 1},
    // Blocks are stored as JSON because they can have many different classes
    blocks: {type: Schema.Types.Mixed, default: {}},
    starting_block_id: {type: Number, default: -1},
    canvas_width: {type: Number, default: -1},
    canvas_height: {type: Number, default: -1},
    bot_name: {type: String, default: 'Tilbot'},
    variables: {type: [Schema.Types.Mixed], default: []},
    settings: {type: Schema.Types.Mixed, default: {}},
    user_id: {type: String, required: true},
    socket: {type: Number},
    active: {type: Boolean, default: true}
}, {minimize: false});
  
ProjectSchema.statics.fromModel = function(model) {
    var schema = new this();
  
    schema.name = model.name;
    schema.current_block_id = model.current_block_id;
    schema.starting_block_id = model.starting_block_id;
    schema.canvas_width = model.canvas_width;
    schema.canvas_height = model.canvas_height;
    schema.bot_name = model.bot_name;
    schema.variables = model.variables;
    schema.settings = model.settings;
    schema.blocks = model.blocks;    
  
    return schema;
}
  
export { ProjectSchema };  