import { Schema, Document, model } from "mongoose";

// Message interface
export interface IMessage {
  timestamp: Date;
  sender: string;
  type: "description" | "message";
  content: string;
}

// Chat interface, extending Mongoose Document
export interface IChat extends Document {
  messages: IMessage[];
}

const MessageSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now },  // Automatically setting the timestamp
  sender: { type: String, required: true },
  type: { type: String, enum: ["description", "message"], required: true },
  content: { type: String, required: true },
});

const ChatSchema: Schema = new Schema({
  messages: { type: [MessageSchema], default: [] },  // Array of messages
});

const Chat = model<IChat>("Chat", ChatSchema);

export default Chat;

