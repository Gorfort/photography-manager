const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const photoRoutes = require("./routes/photoRoutes");
const tagRoutes = require("./routes/tagRoutes");
const locationRoutes = require("./routes/locationRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // ← add this
app.use(express.urlencoded({ extended: true })); // ← and this
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ← and this was missing too

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/locations", locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
