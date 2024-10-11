import GameService from "../../services/gameService";
import SocketService from "../../services/socketService";

export const startGame = async (
  gameCode: string,
  seconds: number,
  totalRounds: number,
) => {
  await GameService.getInstance().switchTurn(gameCode);
  SocketService.getInstance().emitToGameRoom(gameCode, "startGame", {});
  startTimer(gameCode, seconds, totalRounds);
};

export const handleWordGuessed = async (
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
    SocketService.getInstance().emitToGameRoom(gameId, "scoreUpdated", {
      userId,
      points,
    });
  } catch (error) {
    console.error("Error handling wordGuessed event:", error);
  }
};

export const updateUsersWord = (gameId: string) => {
  const socketService = SocketService.getInstance();
  socketService.emitToGameRoom(gameId, "new-word", {});
};

export const startTimer = async (
  gameCode: string,
  seconds: number,
  totalRounds: number,
) => {
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
        await GameService.getInstance().endGame(gameCode);
        socketService.emitToGameRoom(gameCode, "endGame", {});
        return;
      }
    } else {
      socketService.emitToGameRoom(gameCode, "timerTick", seconds);
      seconds--;
    }
  }, 1000); // 1 second interval
};
