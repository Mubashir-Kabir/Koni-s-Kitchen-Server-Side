//required packages
const express = require("express");
const cors = require("cors");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

//root route
app.get("/", (req, res) => {
  res.send("Server is Up...");
});

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
