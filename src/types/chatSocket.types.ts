export interface JoinData {
  gameId: string;
  user: string;
  usersTeam: "team1" | "team2";
  team1: {
    players: string[];
  };
  team2: {
    players: string[];
  };
}
export interface MessageData {
  message: string;
  gameId: string;
  user: string;
  role: string;
  targetWord: string;
  socketId: string;
}
