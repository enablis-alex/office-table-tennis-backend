const { Model, DataTypes } = require("@sequelize/core");
const sequelize = require("../models/index.js");

class Game extends Model {}

// Initialize the model
Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    player1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player1_id",
    },
    player2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player2_id",
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "winner_id",
    },
    player1EloBefore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player1_elo_before",
    },
    player2EloBefore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player2_elo_before",
    },
    player1EloAfter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player1_elo_after",
    },
    player2EloAfter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player2_elo_after",
    },
    player1EloChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player1_elo_change",
    },
    player2EloChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      columnName: "player2_elo_change",
    },
  },
  {
    sequelize,
    modelName: "Game",
    tableName: "games",
    timestamps: true,
  }
);

module.exports = Game;
