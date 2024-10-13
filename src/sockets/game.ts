import { Server, Socket } from "socket.io";
import {
  updateUsersWord,
  startGame,
  handleWordGuessed
} from "./handlers/gameHandlers";

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("startGame", startGame);
    socket.on("wordGuessed", handleWordGuessed);
    socket.on("new-word", (gameId: string) => updateUsersWord(gameId));
    // socket.on("timeUp", (gameId: string) => handleTimeUp(io, gameId)); handleTimeUp needs fixes
    // socket.on("startTimer", startTimer);
  });
};
