/**
 * Calculate ELO rating changes for two players
 * @param {number} player1Elo - Current ELO rating of player 1
 * @param {number} player2Elo - Current ELO rating of player 2
 * @param {number} kFactor - K-factor (default: 32, common in chess/table tennis)
 * @param {number} player1Score - Score for player 1 (1 for win, 0 for loss, 0.5 for draw)
 * @returns {Object} Object containing new ELO ratings and changes
 */
function calculateElo(player1Elo, player2Elo, player1Score, kFactor = 32) {
  // Calculate expected scores
  const expectedScore1 =
    1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));
  const expectedScore2 =
    1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 400));

  // Calculate ELO changes
  const eloChange1 = Math.round(kFactor * (player1Score - expectedScore1));
  const eloChange2 = Math.round(kFactor * (1 - player1Score - expectedScore2));

  // Calculate new ELO ratings
  const newElo1 = player1Elo + eloChange1;
  const newElo2 = player2Elo + eloChange2;

  return {
    player1EloAfter: Math.max(0, newElo1), // Ensure ELO doesn't go below 0
    player2EloAfter: Math.max(0, newElo2),
    player1EloChange: eloChange1,
    player2EloChange: eloChange2,
  };
}

module.exports = { calculateElo };
