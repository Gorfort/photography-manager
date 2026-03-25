const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
