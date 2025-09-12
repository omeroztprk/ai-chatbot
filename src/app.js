const express = require("express");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
