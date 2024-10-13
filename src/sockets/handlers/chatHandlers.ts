import { Socket } from "socket.io";
import { JoinData, MessageData } from "../../types/chatSocket.types";
import { isMessageValid } from "../../utils/wordCheck";
import GameService from "../../services/gameService";
import SocketService from "../../services/socketService";
import GameLogicService from "../../services/gameLogicService";
import chatService from "../../services/chatService";

export const handleJoinRoom = async (socket: Socket, data: JoinData) => {
  socket.join(data.gameId);
  console.log(`User ${data.user} joined room: ${data.gameId}`);

  const game = await GameService.getInstance().getGame(data.gameId);

  if (
    !(
      game.team1.players.includes(data.user) ||
      game.team2.players.includes(data.user)
    )
  ) {
    const team = GameLogicService.getRandomTeam();
    data.usersTeam = team;
    await GameService.getInstance().addUser(data.gameId, team, data.user);
  } else {
    data.usersTeam = game.team1.players.includes(data.user) ? "team1" : "team2";
  }

  const updatedGame = await GameService.getInstance().getGame(data.gameId);
  data.team1.players = updatedGame.team1.players;
  data.team2.players = updatedGame.team2.players;

  console.log(data);

  const socketService = SocketService.getInstance();
  socketService.emitToGameRoom(data.gameId, "userJoined", data);
  socketService.emitToGameRoom(data.gameId, "scoreUpdated", data);
  socketService.emitToGameRoom(data.gameId, "new-word", {});
};

export const handleChatMessage = (messageData: MessageData) => {
  const { message, gameId, user, role, targetWord } = messageData;
  console.log("Message received:", messageData);

  // Need to add check if user is describer, if so,
  // check if message is valid
  if (role === "describer") {
    const { validation } = isMessageValid(message, targetWord);
    if (!validation) {
      console.log("not ok");
      return;
    }
  }

  SocketService.getInstance().emitToGameRoom(gameId, "chatMessage", {
    user,
    message,
    gameId,
  });

  if (role === "guesser") {
    // If user is not describer, so he is guesser
    chatService.checkGuesserMessage(gameId, message, user);
  }
};

export const handleSwapTeam = async (data: JoinData) => {
  const game = await GameService.getInstance().getGame(data.gameId);

  if (game.team1.players.includes(data.user)) {
    await GameService.getInstance().addUser(data.gameId, "team2", data.user);
    await GameService.getInstance().rmUser(data.gameId, "team1", data.user);
  } else {
    await GameService.getInstance().addUser(data.gameId, "team1", data.user);
    await GameService.getInstance().rmUser(data.gameId, "team2", data.user);
  }

  const updatedGame = await GameService.getInstance().getGame(data.gameId);
  data.usersTeam = game.team1.players.includes(data.user) ? "team1" : "team2";
  data.team1.players = updatedGame.team1.players;
  data.team2.players = updatedGame.team2.players;

  console.log(data);
  SocketService.getInstance().emitToGameRoom(data.gameId, "userJoined", data);
};
