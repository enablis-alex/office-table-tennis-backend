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

    // Store ELO ratings before the game
    const player1EloBefore = player1.elo;
    const player2EloBefore = player2.elo;

    // Determine winner score (1 if player1 wins, 0 if player2 wins)
    const player1Score = winnerId === player1Id ? 1 : 0;

    // Calculate new ELO ratings
    const eloResult = calculateElo(
      player1EloBefore,
      player2EloBefore,
      player1Score
    );

    // Update player ELO ratings in database
    await player1.update({ elo: eloResult.player1EloAfter });
    await player2.update({ elo: eloResult.player2EloAfter });

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
          attributes: ["id", "firstName", "lastName", "elo"],
        },
        {
          model: User,
          as: "player2",
          attributes: ["id", "firstName", "lastName", "elo"],
        },
        {
          model: User,
          as: "winner",
          attributes: ["id", "firstName", "lastName", "elo"],
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
          attributes: ["id", "firstName", "lastName", "elo"],
        },
        {
          model: User,
          as: "player2",
          attributes: ["id", "firstName", "lastName", "elo"],
        },
        {
          model: User,
          as: "winner",
          attributes: ["id", "firstName", "lastName", "elo"],
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
          attributes: ["id", "firstName", "lastName", "elo"],
        },
        {
          model: User,
          as: "player2",
          attributes: ["id", "firstName", "lastName", "elo"],
        },
        {
          model: User,
          as: "winner",
          attributes: ["id", "firstName", "lastName", "elo"],
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

module.exports = router;
