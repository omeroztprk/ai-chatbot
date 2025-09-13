const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const config = require("../config");

const router = express.Router();

const https = require("https");

router.post("/", auth, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const upstream = https.request(config.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" } }, (upRes) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    upRes.on("data", (chunk) => {
      res.write(chunk);
      if (res.flush) res.flush();
    });

    upRes.on("end", () => res.end());
  });

  upstream.on("error", (err) => {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Chatbot failed to respond" });
  });

  upstream.write(JSON.stringify({ message }));
  upstream.end();
});

module.exports = router;
