// models/Offer.js

const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: {
    type: String,
    maxlength: 50,
  },
  product_description: {
    type: String,
    maxlength: 500,
  },
  product_price: {
    type: Number,
    max: 100000,
  },
  product_details: Array,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product_image: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

module.exports = Offer;
