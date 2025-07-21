/**
 * Game Commentary Data and Logic
 * 
 * Provides dynamic tournament commentary based on game state,
 * keeping commentary logic separate from UI components
 */

export class TournamentCommentary {
  constructor(tournamentTitle, teamCount, maxGames) {
    this.tournamentTitle = tournamentTitle;
    this.teamCount = teamCount;
    this.maxGames = maxGames;
  }

  /**
   * Get commentary title for current game state
   */
  getTitle(currentGame) {
    if (currentGame === 0) {
      return 'Pre-Tournament Analysis';
    } else if (currentGame === this.maxGames) {
      return 'Final Results Summary';
    } else {
      return `Game ${currentGame} Analysis`;
    }
  }

  /**
   * Get detailed commentary text for current game state
   */
  getText(currentGame, topTeams = [], currentMap = '') {
    if (currentGame === 0) {
      return this.getPreTournamentCommentary();
    } else if (currentGame === this.maxGames) {
      return this.getFinalCommentary(topTeams);
    } else {
      return this.getMidGameCommentary(currentGame, topTeams, currentMap);
    }
  }

  /**
   * Pre-tournament commentary
   */
  getPreTournamentCommentary() {
    return `Welcome to the ${this.tournamentTitle}. ${this.teamCount} elite teams are ready to compete across ${this.maxGames} intense games. Each team will fight for placement points and elimination survival in this high-stakes tournament format.`;
  }

  /**
   * Final tournament commentary
   */
  getFinalCommentary(topTeams) {
    if (topTeams.length > 0) {
      const topTeam = topTeams[0];
      return `Tournament complete! ${topTeam.team} emerges victorious with ${topTeam.totalPoints} points after ${this.maxGames} grueling games. Their consistent performance and strategic gameplay secured their position at the top of the leaderboard.`;
    }
    return `The tournament has concluded after ${this.maxGames} games of intense competition. Final standings have been determined.`;
  }

  /**
   * Mid-game commentary with current standings
   */
  getMidGameCommentary(currentGame, topTeams, currentMap) {
    if (topTeams.length >= 3) {
      const [first, second, third] = topTeams;
      return `After ${currentGame} games on ${currentMap}, ${first.team} leads with ${first.totalPoints} points. ${second.team} (${second.totalPoints}pts) and ${third.team} (${third.totalPoints}pts) are fighting to close the gap. The competition remains fierce with ${this.maxGames - currentGame} games remaining.`;
    } else if (topTeams.length > 0) {
      const leader = topTeams[0];
      return `Game ${currentGame} has concluded on ${currentMap}. ${leader.team} currently leads the standings. The tournament continues with strategic positioning crucial for the remaining games.`;
    }
    return `Game ${currentGame} on ${currentMap} is part of the ongoing tournament progression. Teams are battling for optimal placement points.`;
  }

  /**
   * Get short commentary snippet for compact display
   */
  getShortCommentary(currentGame, topTeams = [], currentMap = '') {
    if (currentGame === 0) {
      return `${this.teamCount} teams ready to compete`;
    } else if (currentGame === this.maxGames) {
      if (topTeams.length > 0) {
        return `${topTeams[0].team} wins with ${topTeams[0].totalPoints} points!`;
      }
      return 'Tournament completed';
    } else {
      if (topTeams.length > 0) {
        const gamesRemaining = this.maxGames - currentGame;
        return `${topTeams[0].team} leads • ${gamesRemaining} games remaining`;
      }
      return `Game ${currentGame} of ${this.maxGames}`;
    }
  }
}

/**
 * Helper function to create commentary instance
 */
export function createCommentary(tournamentTitle, teamCount, maxGames) {
  return new TournamentCommentary(tournamentTitle, teamCount, maxGames);
}