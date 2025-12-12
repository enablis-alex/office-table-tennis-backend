const sequelize = require("./index.js");
const User = require("./User.js");
const Game = require("./Game.js");

// Initialize all models
const models = {
  User,
  Game,
};

// Set up associations
// A user can be player1 in many games
User.hasMany(Game, {
  foreignKey: "player1Id",
  as: "gamesAsPlayer1",
});

// A user can be player2 in many games
User.hasMany(Game, {
  foreignKey: "player2Id",
  as: "gamesAsPlayer2",
});

// A user can be the winner in many games
User.hasMany(Game, {
  foreignKey: "winnerId",
  as: "gamesWon",
});

// A game belongs to player1
Game.belongsTo(User, {
  foreignKey: "player1Id",
  as: "player1",
});

// A game belongs to player2
Game.belongsTo(User, {
  foreignKey: "player2Id",
  as: "player2",
});

// A game belongs to a winner
Game.belongsTo(User, {
  foreignKey: "winnerId",
  as: "winner",
});

module.exports = {
  sequelize,
  models,
};
