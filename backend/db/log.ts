import { Schema, model } from 'mongoose';
import { MessageSchema } from './message.ts';

export const LogSchema = new Schema({
    messages: [MessageSchema],
    session_started: { type: Date, default: Date.now },
    session_closed: { type: Date, default: Date.now },
    project_id: { type: String, required: true },
    participant_id: { type: String, default: "" }
});

export const LogModel = model('log', LogSchema);
