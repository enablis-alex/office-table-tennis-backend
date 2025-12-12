const sequelize = require("./index.js");
const User = require("./User.js");
const Game = require("./Game.js");

// Initialize all models
const models = {
  User,
  Game,
};

// Set up associations
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
