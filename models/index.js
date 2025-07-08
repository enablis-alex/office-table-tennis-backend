const { Sequelize } = require("@sequelize/core");
const config = require("../config/config.js")["development"];
const { User } = require("./User.js");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: "5432",
    ssl: config.ssl,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  {
    models: [User],
  }
);

module.exports = sequelize;
