import { Server, Socket } from "socket.io";
import GameService from "../services/gameService";

const handleTimeUp = async (io: Server, gameId: string) => {
  try {
    const game = await GameService.getInstance().startTurn(gameId);

    if (!game) {
      console.error("Game not found or error in starting a new turn.");
      return;
    }

    const describer = game.team1.players[game.currentTurn % game.team1.players.length];
    const guessers = game.team2.players;
    const roundTime = game.roundTime;

    io.to(gameId).emit("newTurn", { describer, guessers, roundTime });
  } catch (error) {
    console.error("Error handling timeUp event:", error);
  }
};

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("timeUp", (gameId: string) => handleTimeUp(io, gameId));
  });
};
