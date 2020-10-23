// middlewares/isAuthenticated.js
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const tokenToCheck = req.headers.authorization.replace("Bearer ", "");

    const userIdentified = await User.findOne({ token: tokenToCheck }).select(
      "account _id"
    );
    // console.log(userIdentified);  // null
    if (userIdentified) {
      req.user = userIdentified;
      return next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
