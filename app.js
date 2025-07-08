const express = require("express");
const app = express();
const routes = require("./routes/index.js");

// Initialize models
require("./models/associations.js");

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
