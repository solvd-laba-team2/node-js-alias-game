import { Server, Socket } from "socket.io";

interface MessageData {
  message: string;
  gameId: string;
  user: string;
}

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("join room", (gameId: string) => {
      socket.join(gameId);
      console.log(`User ${socket.id} joined room: ${gameId}`);

      // Notify others in the room about the new user
      socket.to(gameId).emit("message", `User ${socket.id} has joined the room.`);
    });

    // Listen for a chat message from a client
    socket.on("chat message", (messageData: MessageData) => {
      const { message, gameId, user } = messageData;
      console.log("Message received:", messageData);

      // Broadcast the message to all clients
      io.to(gameId).emit("chat message", {
        user,
        message,
        gameId,
      });
    });

    // When a user disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
};
