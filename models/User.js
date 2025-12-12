const { Model, DataTypes } = require("@sequelize/core");
const sequelize = require("../models/index.js");

class User extends Model {
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Initialize the model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    elo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

module.exports = User;
