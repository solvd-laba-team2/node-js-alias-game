import { Request, Response } from "express";
import GameService from "../services/gameService";

const gameService = new GameService();

// Render the form for creating a game
export const renderCreateGameForm = (req: Request, res: Response) => {
  res.render("create-game");  // Rendering the createGame.hbs view
};

export const createGame = async (req: Request, res: Response) => {
  const { gameName, difficulty } = req.body;  // Receiving data from the body

  try {
    const newGame = await gameService.createGame(gameName, difficulty);  // Creating a new game
    // Render the game room view with data
    const chatHistory = await gameService.getChatHistory(newGame._id.toString());  // Fetch chat history
    res.render("room", {
      // gameId: newGame._id.toString(),
      gameName: gameName,
      currentUser: req.body.username,  // You can add logic to pass the username
      messages: chatHistory,
      team1: newGame.team1.players,
      team2: newGame.team2.players,
      currentTurn: newGame.currentTurn
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a user to the game
export const addUser = async (req: Request, res: Response) => {
  const { gameId, username, teamId } = req.body;

  try {
    await gameService.addUser(gameId, teamId, username);
    res.status(200).json({ message: `${username} added to the game` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user's score
export const updateScore = async (req: Request, res: Response) => {
  const { gameId, username, points } = req.params;

  try {
    await gameService.updateScore(gameId, username, parseInt(points));
    res.status(200).json({ message: `${username}'s score updated by ${points} points` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chat history
export const getChatHistory = async (req: Request, res: Response) => {
  const { gameId } = req.params;

  try {
    const chatHistory = await gameService.getChatHistory(gameId);
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
    await gameService.addMessage(gameId, sender, message, type);
    res.status(200).json({ message: "Message added to chat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start a new turn
export const startTurn = async (req: Request, res: Response) => {
  const { gameId } = req.params;

  try {
    await gameService.startTurn(gameId);
    res.status(200).json({ message: "Turn started" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  renderCreateGameForm,
  createGame,
  addUser,
  updateScore,
  getChatHistory,
  addMessageToChat,
  startTurn,
};
