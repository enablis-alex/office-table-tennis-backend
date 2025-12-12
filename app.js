const express = require("express");
const app = express();
const routes = require("./routes/index.js");
const gamesRoutes = require("./routes/games.js");
const cors = require("cors");

// Initialize models
require("./models/associations.js");

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
// Register games routes first to avoid conflict with /api/:id
app.use("/api/games", gamesRoutes);
app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
