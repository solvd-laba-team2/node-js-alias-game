import { Server, Socket } from "socket.io";
import GameService from "../services/gameService";
import SocketService from "../services/socketService";

// const handleTimeUp = async (io: Server, gameId: string) => { // needs fixes
//   try {
//     const game = await GameService.getInstance().startTurn(gameId);

//     if (!game) {
//       console.error("Game not found or error in starting a new turn.");
//       return;
//     }

//     const describer =
//       game.team1.players[game.currentTurn % game.team1.players.length];
//     const guessers = game.team2.players;

//     io.to(gameId).emit("newTurn", { describer, guessers });
//   } catch (error) {
//     console.error("Error handling timeUp event:", error);
//   }
// };

const handleWordGuessed = async (
  io: Server,
  gameId: string,
  userId: string,
  points: number,
) => {
  try {
    await GameService.getInstance().updateUserScoreInMemory(
      userId,
      gameId,
      points,
    );

    // console.log(`Score updated for user ${userId} in game ${gameId}`);

    io.to(gameId).emit("scoreUpdated", { userId, points });
  } catch (error) {
    console.error("Error handling wordGuessed event:", error);
  }
};

const updateUsersWord = (gameId: string) => {
  const socketService = SocketService.getInstance();
  socketService.emitToGameRoom(gameId, "new-word", {});
};

const startTimer = (gameCode: string, seconds: number, totalRounds: number) => {
  let roundsLeft = totalRounds;
  const initialTime = seconds;
  const socketService = SocketService.getInstance();
  const timerInterval = setInterval(async () => {
    if (seconds <= 0) {
      roundsLeft--;
      if (roundsLeft > 0) {
        seconds = initialTime; // Reset timer for the new round (assuming each round is 60 seconds)
        await GameService.getInstance().switchTurn(gameCode);
        await GameService.getInstance().generateWord(gameCode);
        const currentRound = totalRounds - roundsLeft + 1;
        socketService.emitToGameRoom(gameCode, "newTurn", currentRound);
        updateUsersWord(gameCode);
      } else {
        clearInterval(timerInterval); // Stop the interval when no rounds are left
        socketService.emitToGameRoom(gameCode, "endGame", {});
        return;
      }
    } else {
      socketService.emitToGameRoom(gameCode, "timerTick", seconds);
      seconds--;
    }
  }, 1000); // 1 second interval
};

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // socket.on("timeUp", (gameId: string) => handleTimeUp(io, gameId)); handleTimeUp needs fixes
    socket.on("startGame", async (gameCode: string, seconds: number, totalRounds: number) => {
      await GameService.getInstance().switchTurn(gameCode);
      io.to(gameCode).emit("startGame");
      io.to(gameCode).emit("blockButtons");
      startTimer(gameCode, seconds, totalRounds);
    });

    socket.on(
      "wordGuessed",
      (data: { gameId: string; userId: string; points: number }) => {
        const { gameId, userId, points } = data;
        handleWordGuessed(io, gameId, userId, points);
      },
    );

    socket.on("new-word", (gameId: string) => updateUsersWord(gameId));

    // socket.on("startTimer", startTimer);
  });
};
