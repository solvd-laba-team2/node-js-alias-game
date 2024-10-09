import { IGame } from "src/models/gameModel";

class GameLogicService {
  // Internal memory to track which players have already been describers
  private static describedPlayers: { [team: string]: string[] } = {
    team1: [],
    team2: []
  };

  // Public method to start a turn in the game
  public static startTurn(game: IGame): { describer: string | null, team: "team1" | "team2" } {
    let team: "team1" | "team2";

    // Randomly select the starting team only in the first turn
    if (game.currentTurn === 0) {
      team = this.getRandomTeam();
    } else {
      // Alternate teams after the first turn
      team = game.currentTurn % 2 === 0 ? "team1" : "team2";
    }

    // Select a describer from the players who haven't described yet
    const describer = this.getRandomDescriber(game[team].players, team);

    // If no describer left, return null to signal end of game
    if (!describer) {
      return { describer: null, team };
    }

    // Increment the turn counter
    game.currentTurn += 1;

    return { describer, team };
  }

  // Private method to randomly select a team (only for the first turn)
  public static getRandomTeam(): "team1" | "team2" {
    return Math.random() > 0.5 ? "team1" : "team2";
  }

  // Private method to randomly select a describer from players who haven't described yet
  private static getRandomDescriber(players: string[], team: "team1" | "team2"): string | null {
    // Filter out players who have already been describers
    const remainingPlayers = players.filter(player => !this.describedPlayers[team].includes(player));

    // If all players in the team have been describers, end the game
    if (remainingPlayers.length === 0) {
      return null; // Return null to indicate that all players have described
    }

    // Randomly select a player from the remaining ones
    const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
    const describer = remainingPlayers[randomIndex];

    // Add the selected player to the list of those who have already described
    this.describedPlayers[team].push(describer);

    return describer;
  }
}

export default GameLogicService;
