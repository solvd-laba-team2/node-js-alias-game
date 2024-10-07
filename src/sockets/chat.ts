import { Server, Socket } from "socket.io";

interface MessageData {
  message: string;
  gameId: string;
  user: string;
}
interface JoinData {
  gameId: string;
  user: string;
}

const handleJoinRoom = (io: Server, socket: Socket, data: JoinData) => {
  socket.join(data.gameId);
  console.log(data);
  console.log(`User ${data.user} joined room: ${data.gameId}`);
  io.to(data.gameId).emit(
    "systemMessage",
    `User "${data.user}" has joined the room!`,
  );
  io.to(data.gameId).emit("new-word");
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

    
    socket.on("join room", (data: JoinData) => handleJoinRoom(io, socket, data));
    

    socket.on("chatMessage", (messageData: MessageData) =>
      handleChatMessage(io, socket, messageData),
    );

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
};
