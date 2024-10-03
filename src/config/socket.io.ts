
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import  GameService  from "../services/gameService"; // Importujemy tylko typ, jeśli potrzebne

let io: Server;

export const initializeSocket = (server: HttpServer, gameService: GameService) => {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join room", (gameId) => {
      socket.join(gameId);
      console.log(`User ${socket.id} joined room: ${gameId}`);
    });

    socket.on("timeUp", async (gameId) => {
      const game = await gameService.startTurn(gameId);

      if (!game) {
        console.error("Game not found or error in starting a new turn.");
        return;
      }

      const describer = game.team1.players[game.currentTurn % game.team1.players.length];
      const guessers = game.team2.players;
      io.to(gameId).emit('newTurn', { describer, guessers });
    });
  });
};

export const getSocketIO = (): Server => io;
