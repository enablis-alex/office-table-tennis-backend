const express = require("express");
const app = express();
const routes = require("./routes/index.js");
const cors = require("cors");

// Initialize models
require("./models/associations.js");

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
