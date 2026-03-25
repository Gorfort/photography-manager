const express = require("express");
const router = express.Router();
const { getAll, create, remove } = require("../controllers/locationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getAll);
router.post("/", authMiddleware, create);
router.delete("/:id", authMiddleware, remove);

module.exports = router;
