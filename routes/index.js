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

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.create({ firstName, lastName });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Unable to create user.", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    await user.destroy();
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete user.", error });
  }
});

router.get("/", async (req, res) => {
  await sequelize.sync();
  const userList = await User.findAll({
    attributes: ["id", "firstName", "lastName"],
  });
  res.json(userList);
});

module.exports = router;
