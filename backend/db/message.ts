import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface MessageSchemaInterface extends Document {
  message: string;
  source: string;
  sent_at: Date;
  audio_file_id?: Types.ObjectId;
}

export interface MessageModelInterface extends Model<MessageSchemaInterface> {}

export const MessageSchema = new Schema({
  message: { type: String },
  source: { type: String },
  sent_at: { type: Date, default: Date.now },
  audio_file_id: { type: Schema.Types.ObjectId },
});

export const MessageModel = model("message", MessageSchema);
