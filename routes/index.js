const express = require("express");
const router = express.Router();
const sequelize = require("../models/index.js");
const User = require("../models/User.js");

router.get("/status", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: "Connection has been established successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to connect to the database.", error });
  }
});

router.get("/", async (req, res) => {
  await sequelize.sync();
  await User.create({ firstName: "John", lastName: "Doe" });
  await User.create({ firstName: "Jane", lastName: "Doe" });
  const userList = await User.findAll({
    attributes: ["firstName", "lastName"],
  });
  res.json(userList);
});

module.exports = router;
