const express = require("express");
const router = express.Router();
const sequelize = require("../models/index.js");
const User = require("../models/User.js");

router.get("/status", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: "Connection has been established successfully." });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      message: "Unable to connect to the database.",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch user.", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, elo } = req.body;

    if (!firstName) {
      return res.status(400).json({ message: "firstName is required" });
    }

    await sequelize.sync({ alter: true });
    const user = await User.create({ firstName, lastName, elo });
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Unable to create user.", error: error.message });
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
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Unable to delete user.", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    await sequelize.sync({ alter: true });
    const userList = await User.findAll({
      attributes: ["id", "firstName", "lastName", "elo", "gamesPlayed"],
    });
    res.json(userList);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch users.", error: error.message });
  }
});

module.exports = router;
