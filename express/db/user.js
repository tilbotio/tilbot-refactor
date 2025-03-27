import { Schema } from 'mongoose';
import pkg from 'mongoose-bcrypt';

let UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, bcrypt: true},
    role: {type: Number, required: true, default: 1},
    active: {type: Boolean, default: true}
});

UserSchema.plugin(pkg);

export { UserSchema };
  
//export mongoose.model('UserSchema', UserSchema);
  