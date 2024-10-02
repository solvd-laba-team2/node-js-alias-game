import { Schema, Document, model } from "mongoose";

interface IScore {
  word: string;
  status: "guessed" | "not guessed";
  guessed: string;
}

interface ITeam {
  players: string[];
  chatID: string;
  score: IScore[];
}

interface IGame extends Document {
  status: "creating" | "playing" | "finished";
  team1: ITeam;
  team2: ITeam;
  wonTeamId?: string;
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

const GameSchema: Schema = new Schema({
  status: {
    type: String,
    enum: ["creating", "playing", "finished"],
    default: "creating",
  },
  team1: { type: TeamSchema, default: {} },
  team2: { type: TeamSchema, default: {} },
  wonTeamId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Game = model<IGame>("Game", GameSchema);

export default Game;
