// index.js

const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(formidable());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const usersRoute = require("./routes/user");
app.use(usersRoute);

const offerRoute = require("./routes/offer");
app.use(offerRoute);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Page Not Found" });
});

app.listen(process.env.PORT, (req, res) => {
  console.log(`Server started on port : ${process.env.PORT}`);
});
