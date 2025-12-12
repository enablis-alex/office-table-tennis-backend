/**
 * Get K-factor based on rating and game count (like chess.com)
 * - Higher K for lower-rated players (faster adjustments)
 * - Higher K for new players (provisional ratings)
 * - Lower K for higher-rated players (more stable)
 */
function getKFactor(rating, gamesPlayed = 0) {
  // Provisional players (first 20 games) use higher K-factor
  if (gamesPlayed < 20) {
    return 40; // Higher K for new players to reach accurate rating faster
  }

  // Variable K-factor based on rating (like chess.com)
  if (rating < 2000) {
    return 32; // Standard K for most players
  } else if (rating < 2400) {
    return 24; // Lower K for strong players
  } else {
    return 16; // Lowest K for expert players (very stable)
  }
}

/**
 * Calculate ELO rating changes for two players
 * @param {number} player1Elo - Current ELO rating of player 1
 * @param {number} player2Elo - Current ELO rating of player 2
 * @param {number} player1Score - Score for player 1 (1 for win, 0 for loss, 0.5 for draw)
 * @param {number} player1GamesPlayed - Number of games player 1 has played
 * @param {number} player2GamesPlayed - Number of games player 2 has played
 * @returns {Object} Object containing new ELO ratings and changes
 */
function calculateElo(
  player1Elo,
  player2Elo,
  player1Score,
  player1GamesPlayed = 0,
  player2GamesPlayed = 0
) {
  // Get K-factors for both players
  const kFactor1 = getKFactor(player1Elo, player1GamesPlayed);
  const kFactor2 = getKFactor(player2Elo, player2GamesPlayed);

  // Calculate expected scores
  const expectedScore1 =
    1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));
  const expectedScore2 =
    1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 400));

  // Calculate ELO changes (each player uses their own K-factor)
  const eloChange1 = Math.round(kFactor1 * (player1Score - expectedScore1));
  const eloChange2 = Math.round(kFactor2 * (1 - player1Score - expectedScore2));

  // Calculate new ELO ratings
  const newElo1 = player1Elo + eloChange1;
  const newElo2 = player2Elo + eloChange2;

  return {
    player1EloAfter: Math.max(0, newElo1), // Ensure ELO doesn't go below 0
    player2EloAfter: Math.max(0, newElo2),
    player1EloChange: eloChange1,
    player2EloChange: eloChange2,
    player1KFactor: kFactor1,
    player2KFactor: kFactor2,
  };
}

module.exports = { calculateElo, getKFactor };
