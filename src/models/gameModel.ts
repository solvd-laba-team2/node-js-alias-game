import { Schema, Document, model } from "mongoose";

// Score interface definition
interface IScore {
  word: string;
  status: "guessed" | "not guessed";
  guessed: string;
}

// Team interface definition
interface ITeam {
  players: string[];
  chatID: string;
  score: IScore[];
}

// Game interface
export interface IGame extends Document {
  gameName: string;  // Added field for the game name
  difficulty: "easy" | "medium" | "hard";  // Added field for the difficulty level
  status: "creating" | "playing" | "finished";
  team1: ITeam;
  team2: ITeam;
  currentTurn: number;
  createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
  word: { type: String },
  status: { type: String, enum: ["guessed", "not guessed"] },
  guessed: { type: String, default: "nobody" },
});

const TeamSchema: Schema = new Schema({
  players: { type: [String], default: [] },
  chatID: { type: String },
  score: { type: [ScoreSchema], default: [] },
});

// Updated game schema with gameName and difficulty fields
const GameSchema: Schema = new Schema({
  gameName: { type: String, required: true },  // New field for the game name
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },  // New field for the difficulty level
  status: {
    type: String,
    enum: ["creating", "playing", "finished"],
    default: "creating",
  },
  team1: { type: TeamSchema, default: {} },
  team2: { type: TeamSchema, default: {} },
  currentTurn: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Game = model<IGame>("Game", GameSchema);

export default Game;
