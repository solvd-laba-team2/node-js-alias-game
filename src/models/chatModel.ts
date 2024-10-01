import { Schema, Document, model } from "mongoose";

interface IMessage {
  timestamp: Date;
  sender: string;
  type: "description" | "message";
  content: string;
}

interface IChat extends Document {
  messages: IMessage[];
}

const MessageSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now },
  sender: { type: String, required: true },
  type: { type: String, enum: ["description", "message"], required: true },
  content: { type: String, required: true },
});

const ChatSchema: Schema = new Schema({
  messages: { type: [MessageSchema], default: [] },
});

const Chat = model<IChat>("Chat", ChatSchema);

export default Chat;
