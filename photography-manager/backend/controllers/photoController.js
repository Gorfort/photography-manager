const fs = require("fs");
const path = require("path");
const Photo = require("../models/Photo");

const getAll = async (req, res) => {
  try {
    const { tag, location, locations, dateFrom, dateTo } = req.query;
    const filter = {};

    if (tag) filter.tags = tag;

    if (location) {
      filter.location = location;
    } else if (locations) {
      filter.location = { $in: locations.split(",") };
    }

    if (dateFrom || dateTo) {
      filter.dateTaken = {};
      if (dateFrom) filter.dateTaken.$gte = new Date(dateFrom);
      if (dateTo) filter.dateTaken.$lte = new Date(dateTo);
    }

    const photos = await Photo.find(filter)
      .populate("tags")
      .populate("location");
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOne = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate("tags")
      .populate("location");
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { title, dateTaken, resolution, location, tags } = req.body;
    const url = req.file ? `/uploads/${req.file.filename}` : "";

    const photo = await Photo.create({
      title,
      url,
      dateTaken: dateTaken || null,
      resolution,
      location: location || null,
      tags: tags || [],
    });
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    // Delete the actual file from uploads folder
    if (photo.url) {
      const filePath = path.join(__dirname, "..", photo.url);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Could not delete file:", err);
      });
    }

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
