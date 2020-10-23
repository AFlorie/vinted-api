// middlewares/isAuthenticated.js
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // console.log(req.headers); // authorization: 'Bearer 5f916f1726327315fcc29016',
  if (req.headers.authorization) {
    const tokenToCheck = req.headers.authorization.replace("Bearer ", "");
    //console.log(tokenToCheck); // 5f916f1726327315fcc29016
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
