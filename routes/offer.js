// routes/offer.js

const express = require("express");
const User = require("../models/User");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //console.log(req.files.picture.path); // C:\Users\Florie\AppData\Local\Temp\upload_ab0352f42a1f468acb16f4ac9c3fcc7c
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    // console.log(req.user); // object User

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    const picturePath = req.files.picture.path;
    //console.log(picturePath);
    const pictureCloud = await cloudinary.uploader.upload(picturePath, {
      folder: "/vinted/offers",
    });

    newOffer.product_image = pictureCloud;
    //console.log(pictureCloud.secure_url);
    await newOffer.save();
    //console.log(newOffer);
    // console.log(offerId);
    //console.log(newOffer.product_details[0]._id);
    // console.log(newOffer.owner.account);
    // console.log(newOffer.owner.account.username);

    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    //console.log(req.params);
    //console.log(req.params.id);
    const id = req.params.id;

    const offerToDelete = await Offer.findByIdAndDelete(id);

    res.send("Offer successfully deleted");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    //console.log(req.query.title); // baskets
    const title = req.query.title;
    let priceMin = req.query.priceMin;
    let priceMax = req.query.priceMax;
    let sort = req.query.sort;
    let page = parseInt(req.query.page);
    const perPage = 10;
    if (!priceMin) {
      priceMin = 0;
    }
    if (!priceMax) {
      priceMax = 100000;
    }
    if (sort === "price-asc" || !sort) {
      sort = "asc";
    } else if (sort === "price-desc") {
      sort = "desc";
    }
    if (!page || page === 1) {
      page = 0;
    } else {
      page -= 1;
    }

    if (title || priceMin || priceMax || sort || page) {
      const offers = await Offer.find({
        product_name: new RegExp(title, "i"),
        product_price: { $lte: priceMax, $gte: priceMin },
      })
        .select("product_name product_description product_price")
        .sort({ product_price: sort })
        .limit(perPage)
        .skip(perPage * page);
      let nbofOffers = Object.keys(offers).length;
      res.status(200).json({ count: nbofOffers, offers });
    } else {
      const offers = await Offer.find().select(
        "product_name product_description product_price"
      );
      res.status(200).json(offers);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findById(id).populate({
      path: "owner",
      select: "account _id",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
