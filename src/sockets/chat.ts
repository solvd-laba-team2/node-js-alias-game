import { Server, Socket } from "socket.io";

interface MessageData {
  message: string;
  gameId: string;
  user: string;
}

const handleJoinRoom = (socket: Socket, gameId: string) => {
  socket.join(gameId);
  console.log(`User ${socket.id} joined room: ${gameId}`);
  socket.to(gameId).emit("message", `User ${socket.id} has joined the room.`);
};

const handleChatMessage = (
  io: Server,
  socket: Socket,
  messageData: MessageData,
) => {
  const { message, gameId, user } = messageData;
  console.log("Message received:", messageData);
  io.to(gameId).emit("chatMessage", { user, message, gameId });
};

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("join room", (gameId: string) => handleJoinRoom(socket, gameId));
    socket.on("chatMessage", (messageData: MessageData) =>
      handleChatMessage(io, socket, messageData),
    );

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
};
