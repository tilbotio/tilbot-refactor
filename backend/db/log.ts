import { Schema, model, type Document, type Model } from "mongoose";
import { MessageSchema, type MessageSchemaInterface } from "./message.ts";

export interface LogSchemaInterface extends Document {
  messages: MessageSchemaInterface[];
  session_started: Date;
  session_closed: Date;
  project_id: string;
  participant_id: string;
}

export interface LogModelInterface extends Model<LogSchemaInterface> {}

export const LogSchema = new Schema({
  messages: [MessageSchema],
  session_started: { type: Date, default: Date.now },
  session_closed: { type: Date, default: Date.now },
  project_id: { type: String, required: true },
  participant_id: { type: String, default: "" },
});

export const LogModel = model<LogSchemaInterface, LogModelInterface>(
  "log",
  LogSchema
);
