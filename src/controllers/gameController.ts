import { Request, Response } from "express";
import chatService from "../services/chatService";
import GameService from "../services/gameService";
import { shortenId, getOriginalId } from "../utils/hash";
import { Types } from "mongoose";

// Render the form for creating a game
export const renderCreateGameForm = (req: Request, res: Response) => {
  res.render("create-game"); // Rendering the createGame.hbs view
};

export const renderRoomPage = async (req: Request, res: Response) => {
  const gameCode = req.params.gameId;
  const gameId = getOriginalId(gameCode);

  if (!Types.ObjectId.isValid(gameId)) {
    console.log("Not valid ~ renderRoomPage ~ gameId:", gameId);
    return res.render("game-404");
  }

  const game = await GameService.getInstance().getGame(gameCode);

  if (!game) {
    console.log("Game not found (!game) ~ renderRoomPage ~ game:");
    return res.render("game-404");
  }

  res.render("room", {
    // gameId: newGame._id.toString(),
    gameName: gameCode,
    currentUser: res.locals.username,
    team1: game.team1.players,
    team2: game.team2.players,
    currentTurn: game.currentTurn,
    roundTime: game.roundTime,
    totalRounds: game.totalRounds,
    status: game.status,
  });
};

export const getGenerateWord = async (req: Request, res: Response) => {
  const gameCode = req.params.gameCode;
  try {
    const word = await GameService.getInstance().generateWord(gameCode);
    res.status(200).json({ word });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCurrentWord = (req: Request, res: Response) => {
  try {
    const gameCode = req.params.gameCode;
    const currentWord = GameService.getInstance().getCurrentWord(gameCode);
    res.status(200).json({ word: currentWord });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(404).json({ error: "Current word not found" });
    }
  }
};

export const createGame = async (req: Request, res: Response) => {
  const { gameName, difficulty, roundTime, totalRounds } = req.body; // Receiving data from the body
  try {
    const newGame = await GameService.getInstance().createGame(
      gameName,
      difficulty,
      roundTime,
      totalRounds,
    ); // Creating a new game
    const shortId = shortenId(newGame._id.toString());
    res.redirect(`/game/${shortId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentScores = async (req: Request, res: Response) => {
  try {
    const gameCode = req.params.gameCode;
    const scores = await GameService.getInstance().getCurrentScores(gameCode);
    res.status(200).json({ scores });
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(404).json({ error: "Current scores not found" });
    }
  }
};

// Update user's score
export const updateScore = async (req: Request, res: Response) => {
  const { gameId, username, points } = req.params;

  try {
    await GameService.getInstance().updateUserScoreInMemory(
      username,
      gameId,
      parseInt(points),
    );
    res
      .status(200)
      .json({ message: `${username}'s score updated by ${points} points` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chat history
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { gameCode } = req.params;
    const chatHistory = await chatService.getChatHistory(gameCode);
    res.status(200).json({ chat: chatHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a message to the chat
export const addMessageToChat = async (req: Request, res: Response) => {
  const { gameCode } = req.params;
  const { sender, message, role, targetWord, socketId } = req.body;
  try {
    console.log(sender, message);
    await chatService.addMessageToChat(
      gameCode,
      sender,
      message,
      role,
      targetWord,
      socketId,
    );
    res.status(200).json({ message: "Message added to chat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const renderJoinGamePage = async (req: Request, res: Response) => {
  try {
    const games = await GameService.getInstance().getOnlyNotStartedGames();
    res.render("join-game", { games: games });
  } catch (error) {
    console.error("Error fetching games: ", error);
    res.render("join-game", { games: [] });
  }
};

export const joinGame = async (req: Request, res: Response) => {
  const { gameCode } = req.body;
  try {
    const game = await GameService.getInstance().getGame(gameCode);
    if (!game) {
      const games = await GameService.getInstance().getOnlyNotStartedGames();
      res.status(404).render("join-game", {
        errorMessage: "No game with such code!",
        games,
      });
    } else {
      res.redirect(`/game/${gameCode}`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//endpoint to get teams
export const getTeams = async (req: Request, res: Response) => {
  const { gameCode } = req.params;
  try {
    const game = await GameService.getInstance().getGame(gameCode);
    console.log(game);
    const teams = { team1: game.team1.players, team2: game.team2.players };
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const switchTurn = async (req: Request, res: Response) => {
  const gameCode = req.params.gameCode;
  const currentTurn = await GameService.getInstance().switchTurn(gameCode);
  res.status(200).json(currentTurn);
};

export const getTurn = async (req: Request, res: Response) => {
  const gameCode = req.params.gameCode;
  const currentTurnData = await GameService.getInstance().getCurrentTurn(
    gameCode,
  );
  if (!currentTurnData) {
    res.status(404).json({
      error: "current turn not found",
    });
    return;
  }
  res.status(200).json(currentTurnData);
};

export default {
  renderCreateGameForm,
  createGame,
  renderJoinGamePage,
  joinGame,
  updateScore,
  getChatHistory,
  addMessageToChat,
  renderRoomPage,
  getGenerateWord,
  getCurrentWord,
  getTeams,
  getCurrentScores,
  switchTurn,
  getTurn,
};
