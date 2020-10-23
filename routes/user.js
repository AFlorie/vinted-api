// models/user.js

const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encbase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/user/signup", async (req, res) => {
  try {
    const username = req.fields.username;
    const email = req.fields.email;
    const phone = req.fields.phone;
    const password = req.fields.password;

    const userCheck = await User.findOne({ email: email });
    let result = {};
    let statusCode = 0;
    //console.log(userCheck);

    if (userCheck === null) {
      if (username && email && password) {
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encbase64);
        const token = uid2(16);

        const picturePath = req.files.picture.path;
        //console.log(picturePath);
        const pictureCloud = await cloudinary.uploader.upload(picturePath, {
          folder: "/vinted/profilePicture",
        });

        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
            avatar: pictureCloud,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        await newUser.save();

        const userCreated = await User.findOne({ email: email });
        statusCode = 200;
        result = {
          _id: userCreated._id,
          token: token,
          account: {
            username: username,
            phone: phone,
          },
        };
      } else {
        statusCode = 400;
        //console.log(status);
        result = { message: "Missing parameters" };
      }
    } else {
      statusCode = 400;
      //console.log(status);
      result = { message: "Email already exists in database." };
    }
    res.status(statusCode).json({ result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const email = req.fields.email;
    const password = req.fields.password;
    const userCheck = await User.findOne({ email: email });
    let result = {};
    let statusCode = 0;
    const hashToTest = SHA256(password + userCheck.salt).toString(encbase64);
    // console.log(email, password);
    // console.log(userCheck.hash);
    // console.log(hashToTest);
    if (userCheck !== null && userCheck.hash === hashToTest) {
      statusCode = 200;
      result = {
        _id: userCheck.id,
        token: userCheck.token,
        account: {
          username: userCheck.account.username,
          phone: userCheck.account.phone,
        },
      };
    } else {
      statusCode = 400;
      result = { error: "Wrong Password/Email." };
    }
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
});
module.exports = router;
