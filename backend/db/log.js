import { Schema, mongoose } from 'mongoose';
import { MessageSchema } from './message.js';

export const LogSchema = new Schema({
    messages: [MessageSchema],
    session_started: { type: Date, default: Date.now },
    session_closed: { type: Date, default: Date.now },
    project_id: { type: String, required: true },
    participant_id: { type: String, default: "" }
});

export const LogModel = mongoose.model('logschemas', LogSchema);
