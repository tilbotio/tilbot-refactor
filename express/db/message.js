import { Schema } from 'mongoose';

let MessageSchema = new Schema({
    message: { type: String },
    source: { type: String },
    sent_at: { type: Date, default: Date.now }
});

export { MessageSchema };
  