const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    dateTaken: { type: Date },
    resolution: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
