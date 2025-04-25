import { Schema, mongoose } from 'mongoose';

export const MessageSchema = new Schema({
    message: { type: String },
    source: { type: String },
    sent_at: { type: Date, default: Date.now }
});

export const MessageModel = mongoose.model('messageschemas', MessageSchema);
