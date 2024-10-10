import { Server, Socket } from "socket.io";
import GameService from "../services/gameService";

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

const updateUsersWord = async (io: Server, gameId: string) => {
  io.to(gameId).emit("new-word");
};

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // socket.on("timeUp", (gameId: string) => handleTimeUp(io, gameId)); handleTimeUp needs fixes
    socket.on("startGame", async (gameCode) => {
      await GameService.getInstance().switchTurn(gameCode);
      io.to(gameCode).emit("startGame");
      io.to(gameCode).emit("blockButtons");
    });

    socket.on(
      "wordGuessed",
      (data: { gameId: string; userId: string; points: number }) => {
        const { gameId, userId, points } = data;
        handleWordGuessed(io, gameId, userId, points);
      },
    );

    socket.on("new-word", (gameId: string) => updateUsersWord(io, gameId));

    socket.on(
      "startTimer",
      (gameCode: string, seconds: number, totalRounds: number) => {
        const initialTime = seconds;
        const timerInterval = setInterval(async () => {
          if (seconds <= 0) {
            totalRounds--;
            if (totalRounds > 0) {
              seconds = initialTime; // Reset timer for the new round (assuming each round is 60 seconds)
              await GameService.getInstance().switchTurn(gameCode);
              io.to(gameCode).emit("newTurn");
            } else {
              clearInterval(timerInterval); // Stop the interval when no rounds are left
              return;
            }
          } else {
            io.to(gameCode).emit("timerTick", seconds);
            seconds--;
          }
        }, 1000); // 1 second interval
      },
    );
  });
};
