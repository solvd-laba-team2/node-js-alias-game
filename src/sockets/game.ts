import { Server, Socket } from "socket.io";
import GameService from "../services/gameService";

const handleTimeUp = async (io: Server, gameId: string) => { // needs fixes
  try {
    const game = await GameService.getInstance().startTurn(gameId);
    console.log(game);
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


const handleWordGuessed = async (io: Server, gameId: string, userId: string, points: number) => {
  try {

    await GameService.getInstance().updateUserScoreInMemory(userId, gameId, points);

    // console.log(`Score updated for user ${userId} in game ${gameId}`);

    io.to(gameId).emit("scoreUpdated", { userId, points });
  } catch (error) {
    console.error("Error handling wordGuessed event:", error);
  }
};

const updateUsersWord = async (io: Server, gameId: string) => {
  io.to(gameId).emit("new-word");
};


export default (io: Server) => {
  io.on("connection", (socket: Socket) => {

    socket.on("timeUp", (gameId: string) => handleTimeUp(io, gameId));

    socket.on("wordGuessed", (data: { gameId: string, userId: string, points: number }) => {
      const { gameId, userId, points } = data;
      handleWordGuessed(io, gameId, userId, points);
    });
    
    socket.on("new-word", (gameId: string) => updateUsersWord(io, gameId));
  });


};

