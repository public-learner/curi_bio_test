// Load Config file
require("dotenv").config();

const express = require("express");
const app = express();
const port = 3004;

const cors = require("cors");

app.use(
  express.urlencoded(),
  cors({
    origin: "http://localhost:3004",
  })
);

require("./router/routes")(app);


app.listen(port, () => console.log(`API listening on port ${port}!`));