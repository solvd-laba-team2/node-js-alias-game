import { Request, Response } from "express";
import GameService from "../services/gameService";
import { shortenId, getOriginalId } from "../utils/hash";
import { Types } from "mongoose";

// Render the form for creating a game
export const renderCreateGameForm = (req: Request, res: Response) => {
  res.render("create-game"); // Rendering the createGame.hbs view
};

export const renderRoomPage = async (req: Request, res: Response) => {
  const gameId = req.params.gameId;
  const id = getOriginalId(gameId);

  const errorOptions = {
    gameName: "Game not found",
    currentUser: res.locals.username,
    messages: [],
    team1: [],
    team2: [],
    currentTurn: 0,
  };

  if (!Types.ObjectId.isValid(id)) {
    return res.render("room", errorOptions);
  }

  const game = await GameService.getInstance().getGame(id);

  if (!game) {
    return res.render("room", errorOptions);
  }

  const chatHistory = await GameService.getInstance().getChatHistory(id);

  res.render("room", {
    // gameId: newGame._id.toString(),
    gameName: gameId,
    currentUser: res.locals.username,
    messages: chatHistory,
    team1: game.team1.players,
    team2: game.team2.players,
    currentTurn: game.currentTurn,
  });
};

export const createGame = async (req: Request, res: Response) => {
  const { gameName, difficulty } = req.body; // Receiving data from the body
  try {
    const newGame = await GameService.getInstance().createGame(
      gameName,
      difficulty,
    ); // Creating a new game
    const shortId = shortenId(newGame._id.toString());
    res.redirect(`/game/${shortId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a user to the game
export const addUser = async (req: Request, res: Response) => {
  const { gameId, username, teamId } = req.body;

  try {
    await GameService.getInstance().addUser(gameId, teamId, username);
    res.status(200).json({ message: `${username} added to the game` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user's score
export const updateScore = async (req: Request, res: Response) => {
  const { gameId, username, points } = req.params;

  try {
    await GameService.getInstance().updateScore(
      gameId,
      username,
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
  const { gameId } = req.params;

  try {
    const chatHistory = await GameService.getInstance().getChatHistory(gameId);
    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a message to the chat
export const addMessageToChat = async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { sender, message, type } = req.body;

  try {
    await GameService.getInstance().addMessage(gameId, sender, message, type);
    res.status(200).json({ message: "Message added to chat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start a new turn
export const startTurn = async (req: Request, res: Response) => {
  const { gameId } = req.params;

  try {
    await GameService.getInstance().startTurn(gameId);
    res.status(200).json({ message: "Turn started" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const renderJoinGamePage = async (req: Request, res: Response) => {
  const games = await GameService.getInstance().getOnlyNotStartedGames();
  res.render("join-game", { games: games });
};

export const joinGame = async (req: Request, res: Response) => {
  const { gameCode } = req.body;
  try {
    res.redirect(`/game/${gameCode}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

export default {
  renderCreateGameForm,
  createGame,
  renderJoinGamePage,
  joinGame,
  addUser,
  updateScore,
  getChatHistory,
  addMessageToChat,
  startTurn,
  renderRoomPage
};
