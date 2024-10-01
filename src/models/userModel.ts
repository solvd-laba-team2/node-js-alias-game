import { Schema, Document, model } from "mongoose";

interface IUser extends Document {
  username: string;
  password: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    wordsGuessed: number;
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, "Please enter username"],
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
  },
  stats: {
    gamesPlayed: { type: Number, required: true, default: 0 },
    gamesWon: { type: Number, required: true, default: 0 },
    wordsGuessed: { type: Number, required: true, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = model<IUser>("User", UserSchema);

export default User;
