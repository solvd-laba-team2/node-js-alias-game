import { Server, Socket } from "socket.io";
import { JoinData } from "../types/chatSocket.types";
import {
  handleJoinRoom,
  handleChatMessage,
  handleSwapTeam,
} from "./handlers/chatHandlers";

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("joinRoom", (data: JoinData) => handleJoinRoom(socket, data));
    socket.on("chatMessage", handleChatMessage);
    socket.on("swapTeam", handleSwapTeam);

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
};
