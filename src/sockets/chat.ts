import { Server, Socket } from "socket.io";

import { handleJoinRoom, handleChatMessage, handleSwapTeam } from "../services/chatService";
import { JoinData, MessageData } from "../types/chatSocket.types";


export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("join room", (data: JoinData) => handleJoinRoom(io, socket, data));


    socket.on("chatMessage", (messageData: MessageData) =>
      handleChatMessage(messageData),
    );

    socket.on("swapTeam", (data: JoinData) => {
      handleSwapTeam(io, socket, data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
};
