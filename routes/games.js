const express = require("express");
const router = express.Router();
const sequelize = require("../models/index.js");
const Game = require("../models/Game.js");
const User = require("../models/User.js");
const { calculateElo } = require("../utils/eloCalculator.js");
const { addGameForeignKeys } = require("../utils/addForeignKeys.js");

// Record a new game
router.post("/", async (req, res) => {
  try {
    const { player1Id, player2Id, winnerId } = req.body;

    // Validation
    if (!player1Id || !player2Id || !winnerId) {
      return res.status(400).json({
        message: "player1Id, player2Id, and winnerId are required",
      });
    }

    if (player1Id === player2Id) {
      return res.status(400).json({
        message: "player1Id and player2Id must be different",
      });
    }

    if (winnerId !== player1Id && winnerId !== player2Id) {
      return res.status(400).json({
        message: "winnerId must be either player1Id or player2Id",
      });
    }

    // Sync database to ensure Game table exists
    await sequelize.sync({ alter: true });
    // Ensure foreign key constraints exist (sync doesn't always create them)
    await addGameForeignKeys(sequelize);

    // Fetch both players
    const player1 = await User.findByPk(player1Id);
    const player2 = await User.findByPk(player2Id);

    if (!player1) {
      return res.status(404).json({ message: "Player 1 not found" });
    }

    if (!player2) {
      return res.status(404).json({ message: "Player 2 not found" });
    }

    // Store ELO ratings and game counts before the game
    const player1EloBefore = player1.elo;
    const player2EloBefore = player2.elo;
    const player1GamesPlayed = player1.gamesPlayed || 0;
    const player2GamesPlayed = player2.gamesPlayed || 0;

    // Determine winner score (1 if player1 wins, 0 if player2 wins)
    const player1Score = winnerId === player1Id ? 1 : 0;

    // Calculate new ELO ratings with variable K-factors
    const eloResult = calculateElo(
      player1EloBefore,
      player2EloBefore,
      player1Score,
      player1GamesPlayed,
      player2GamesPlayed
    );

    // Update player statistics
    const player1Wins = player1.wins || 0;
    const player1Losses = player1.losses || 0;
    const player1Draws = player1.draws || 0;
    const player2Wins = player2.wins || 0;
    const player2Losses = player2.losses || 0;
    const player2Draws = player2.draws || 0;

    // Update player1 stats
    const player1Update = {
      elo: eloResult.player1EloAfter,
      gamesPlayed: player1GamesPlayed + 1,
    };
    if (winnerId === player1Id) {
      player1Update.wins = player1Wins + 1;
    } else if (winnerId === player2Id) {
      player1Update.losses = player1Losses + 1;
    } else {
      // Draw (if winnerId is neither player, though unlikely in table tennis)
      player1Update.draws = player1Draws + 1;
    }

    // Update player2 stats
    const player2Update = {
      elo: eloResult.player2EloAfter,
      gamesPlayed: player2GamesPlayed + 1,
    };
    if (winnerId === player2Id) {
      player2Update.wins = player2Wins + 1;
    } else if (winnerId === player1Id) {
      player2Update.losses = player2Losses + 1;
    } else {
      // Draw
      player2Update.draws = player2Draws + 1;
    }

    await player1.update(player1Update);
    await player2.update(player2Update);

    // Create game record
    const game = await Game.create({
      player1Id,
      player2Id,
      winnerId,
      player1EloBefore,
      player2EloBefore,
      player1EloAfter: eloResult.player1EloAfter,
      player2EloAfter: eloResult.player2EloAfter,
      player1EloChange: eloResult.player1EloChange,
      player2EloChange: eloResult.player2EloChange,
    });

    // Fetch the game with player details
    const gameWithPlayers = await Game.findByPk(game.id, {
      include: [
        {
          model: User,
          as: "player1",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
        {
          model: User,
          as: "player2",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
        {
          model: User,
          as: "winner",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
      ],
    });

    res.status(201).json(gameWithPlayers);
  } catch (error) {
    console.error("Error recording game:", error);
    res
      .status(500)
      .json({ message: "Unable to record game.", error: error.message });
  }
});

// Predict ELO changes for a potential match between two players
router.get("/predict", async (req, res) => {
  try {
    const { player1Id, player2Id } = req.query;

    // Validation
    if (!player1Id || !player2Id) {
      return res.status(400).json({
        message: "player1Id and player2Id query parameters are required",
      });
    }

    if (player1Id === player2Id) {
      return res.status(400).json({
        message: "player1Id and player2Id must be different",
      });
    }

    // Fetch both players
    const player1 = await User.findByPk(player1Id);
    const player2 = await User.findByPk(player2Id);

    if (!player1) {
      return res.status(404).json({ message: "Player 1 not found" });
    }

    if (!player2) {
      return res.status(404).json({ message: "Player 2 not found" });
    }

    const player1Elo = player1.elo;
    const player2Elo = player2.elo;
    const player1GamesPlayed = player1.gamesPlayed || 0;
    const player2GamesPlayed = player2.gamesPlayed || 0;

    // Calculate ELO changes if player1 wins
    const ifPlayer1Wins = calculateElo(
      player1Elo,
      player2Elo,
      1, // player1 wins
      player1GamesPlayed,
      player2GamesPlayed
    );

    // Calculate ELO changes if player2 wins
    const ifPlayer2Wins = calculateElo(
      player1Elo,
      player2Elo,
      0, // player1 loses (player2 wins)
      player1GamesPlayed,
      player2GamesPlayed
    );

    res.json({
      player1: {
        id: player1.id,
        firstName: player1.firstName,
        lastName: player1.lastName,
        currentElo: player1Elo,
        gamesPlayed: player1GamesPlayed,
        ifWins: {
          eloChange: ifPlayer1Wins.player1EloChange,
          newElo: ifPlayer1Wins.player1EloAfter,
        },
        ifLoses: {
          eloChange: ifPlayer2Wins.player1EloChange,
          newElo: ifPlayer2Wins.player1EloAfter,
        },
      },
      player2: {
        id: player2.id,
        firstName: player2.firstName,
        lastName: player2.lastName,
        currentElo: player2Elo,
        gamesPlayed: player2GamesPlayed,
        ifWins: {
          eloChange: ifPlayer2Wins.player2EloChange,
          newElo: ifPlayer2Wins.player2EloAfter,
        },
        ifLoses: {
          eloChange: ifPlayer1Wins.player2EloChange,
          newElo: ifPlayer1Wins.player2EloAfter,
        },
      },
    });
  } catch (error) {
    console.error("Error predicting ELO changes:", error);
    res.status(500).json({
      message: "Unable to predict ELO changes.",
      error: error.message,
    });
  }
});

// Get all games
router.get("/", async (req, res) => {
  try {
    await sequelize.sync({ alter: true });
    // Ensure foreign key constraints exist
    await addGameForeignKeys(sequelize);
    const games = await Game.findAll({
      include: [
        {
          model: User,
          as: "player1",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
        {
          model: User,
          as: "player2",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
        {
          model: User,
          as: "winner",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch games.", error: error.message });
  }
});

// Get a specific game by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: "player1",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
        {
          model: User,
          as: "player2",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
        {
          model: User,
          as: "winner",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "elo",
            "gamesPlayed",
            "wins",
            "losses",
            "draws",
          ],
        },
      ],
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch game.", error: error.message });
  }
});

// Delete a game and reverse ELO changes
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the game
    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    // Fetch both players
    const player1 = await User.findByPk(game.player1Id);
    const player2 = await User.findByPk(game.player2Id);

    if (!player1 || !player2) {
      return res.status(404).json({
        message: "One or both players not found. Cannot reverse ELO changes.",
      });
    }

    // Reverse the ELO changes
    // If player1 gained X points, subtract X. If player2 lost Y points, add Y back.
    const player1NewElo = player1.elo - game.player1EloChange;
    const player2NewElo = player2.elo - game.player2EloChange;

    // Ensure ELO doesn't go below 0
    const finalPlayer1Elo = Math.max(0, player1NewElo);
    const finalPlayer2Elo = Math.max(0, player2NewElo);

    // Decrement games played (but don't go below 0)
    const player1NewGamesPlayed = Math.max(0, (player1.gamesPlayed || 0) - 1);
    const player2NewGamesPlayed = Math.max(0, (player2.gamesPlayed || 0) - 1);

    // Reverse win/loss/draw statistics
    const player1Wins = Math.max(
      0,
      (player1.wins || 0) - (game.winnerId === game.player1Id ? 1 : 0)
    );
    const player1Losses = Math.max(
      0,
      (player1.losses || 0) - (game.winnerId === game.player2Id ? 1 : 0)
    );
    const player1Draws = Math.max(
      0,
      (player1.draws || 0) -
        (game.winnerId !== game.player1Id && game.winnerId !== game.player2Id
          ? 1
          : 0)
    );

    const player2Wins = Math.max(
      0,
      (player2.wins || 0) - (game.winnerId === game.player2Id ? 1 : 0)
    );
    const player2Losses = Math.max(
      0,
      (player2.losses || 0) - (game.winnerId === game.player1Id ? 1 : 0)
    );
    const player2Draws = Math.max(
      0,
      (player2.draws || 0) -
        (game.winnerId !== game.player1Id && game.winnerId !== game.player2Id
          ? 1
          : 0)
    );

    // Store current values before reversal for response
    const player1EloBeforeReversal = player1.elo;
    const player2EloBeforeReversal = player2.elo;

    // Update both players' ELO ratings, game counts, and stats (reverse the changes)
    await player1.update({
      elo: finalPlayer1Elo,
      gamesPlayed: player1NewGamesPlayed,
      wins: player1Wins,
      losses: player1Losses,
      draws: player1Draws,
    });
    await player2.update({
      elo: finalPlayer2Elo,
      gamesPlayed: player2NewGamesPlayed,
      wins: player2Wins,
      losses: player2Losses,
      draws: player2Draws,
    });

    // Delete the game record
    await game.destroy();

    res.json({
      message: "Game deleted successfully. ELO ratings have been reversed.",
      reversedEloChanges: {
        player1: {
          id: player1.id,
          eloBeforeReversal: player1EloBeforeReversal,
          eloAfterReversal: finalPlayer1Elo,
          change: -game.player1EloChange,
        },
        player2: {
          id: player2.id,
          eloBeforeReversal: player2EloBeforeReversal,
          eloAfterReversal: finalPlayer2Elo,
          change: -game.player2EloChange,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    res
      .status(500)
      .json({ message: "Unable to delete game.", error: error.message });
  }
});

module.exports = router;
