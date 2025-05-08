// Config

const express = require("express");

const app = express();

// Load Routers
const mainRouter = require("./routes/mainRouter");
app.use("/", mainRouter);

app.listen(process.env.PORT, () => console.log("Listeining on port 3000"));
