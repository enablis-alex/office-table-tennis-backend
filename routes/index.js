const express = require("express");
const router = express.Router();
const sequelize = require("../models/index.js");
const { User } = require("../models/User.js");

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
  const user = await User.create({ firstName: "John", lastName: "Doe" });
  res.json({ message: user.getFullName() });
});

module.exports = router;
