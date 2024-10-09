import { Server, Socket } from "socket.io";
import GameService from "../services/gameService";
import GameLogicService from "../services/gameLogicService";

interface MessageData {
  message: string;
  gameId: string;
  user: string;
}

interface JoinData {
  gameId: string;
  user: string;
  usersTeam: "team1" | "team2";
  team1: {
    players: string[];
  };
  team2: {
    players: string[];
  };
}

// Map to track which socket IDs belong to which users and their game IDs
const userSocketMap: { [userId: string]: { socketId: string; gameId: string }[] } = {};

const handleJoinRoom = async (io: Server, socket: Socket, data: JoinData) => {
  socket.join(data.gameId);
  console.log(data);
  console.log(`User ${data.user} joined room: ${data.gameId}`);

  const game = await GameService.getInstance().getGame(data.gameId);

  // Check if the user is already part of the game
  if (!(game.team1.players.includes(data.user) || game.team2.players.includes(data.user))) {
    const team = GameLogicService.getRandomTeam();
    data.usersTeam = team;
    await GameService.getInstance().addUser(data.gameId, team, data.user);
  } else {
    data.usersTeam = game.team1.players.includes(data.user) ? "team1" : "team2";
  }

  // Add the socket ID and game ID to the userSocketMap
  if (!userSocketMap[data.user]) {
    userSocketMap[data.user] = []; // Initialize an array for the user if it doesn't exist
  }
  userSocketMap[data.user].push({ socketId: socket.id, gameId: data.gameId });

  const updatedGame = await GameService.getInstance().getGame(data.gameId);
  data.team1.players = updatedGame.team1.players;
  data.team2.players = updatedGame.team2.players;

  console.log(data);
  io.to(data.gameId).emit("userJoined", data);
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
