import Chat, { IChat, IMessage } from "../models/chatModel";

// Create or retrieve chat by gameId
async function getOrCreateChat(gameId: string): Promise<IChat | null> {
  let chat = await Chat.findById(gameId).lean();  // Using lean() to return a plain object
  if (!chat) {
    chat = new Chat({ _id: gameId });
    await chat.save();
  }
  return chat;
}

// Add a message to the chat
async function addMessageToChat(gameId: string, sender: string, message: string, type: "description" | "message") {
  const chat = await getOrCreateChat(gameId);

  // Create a partial IMessage object, without the timestamp field
  const newMessage: Partial<IMessage> = { sender, content: message, type };

  // Add the message to the chat, TypeScript accepts partial IMessage
  chat.messages.push(newMessage as IMessage);  // Cast to IMessage
  await chat.save();
}

// Retrieve chat history for the game
async function getChatHistory(gameId: string): Promise<IMessage[]> {
  const chat = await Chat.findById(gameId).lean();  // lean() returns a plain object
  return chat ? chat.messages : [];
}

export default {
  addMessageToChat,
  getChatHistory,
};
