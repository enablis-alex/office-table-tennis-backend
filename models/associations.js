const sequelize = require("./index.js");
const User = require("./User.js");

// Initialize all models
const models = {
  User,
};

// Add any associations here if needed
// Example: User.hasMany(OtherModel)

module.exports = {
  sequelize,
  models,
};
