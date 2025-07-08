const { Sequelize } = require("@sequelize/core");
const config = require("../config/config.js")["development"];

const sequelize = new Sequelize({
  database: config.database,
  user: config.username,
  password: config.password,
  host: config.host,
  dialect: config.dialect,
  port: "5432",
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

module.exports = sequelize;
