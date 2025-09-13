const express = require("express");
const cors = require("cors");
const config = require("./config");

// Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

const app = express();

const allowedOrigins =
    (config.CORS_ORIGIN || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: false,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
