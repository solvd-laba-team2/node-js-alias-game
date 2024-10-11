import { Server, Socket } from "socket.io";
import {
  handleWordGuessed,
  updateUsersWord,
  startGame,
} from "./handlers/gameHandlers";

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // socket.on("timeUp", (gameId: string) => handleTimeUp(io, gameId)); handleTimeUp needs fixes
    socket.on("startGame", startGame);

    socket.on(
      "wordGuessed",
      (data: { gameId: string; userId: string; points: number }) => {
        const { gameId, userId, points } = data;
        handleWordGuessed(gameId, userId, points);
      },
    );

    socket.on("new-word", (gameId: string) => updateUsersWord(gameId));

    // socket.on("startTimer", startTimer);
  });
};
