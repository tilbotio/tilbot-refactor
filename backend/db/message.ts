import { Schema, model, type Document, type Model } from 'mongoose';

export interface MessageSchemaInterface extends Document {
    message: string;
    source: string;
    sent_at: Date;
};

export interface MessageModelInterface extends Model<MessageSchemaInterface> { };

export const MessageSchema = new Schema({
    message: { type: String },
    source: { type: String },
    sent_at: { type: Date, default: Date.now }
});

export const MessageModel = model('message', MessageSchema);
