const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const config = require("../config");

const router = express.Router();

router.post("/", auth, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await axios({
            method: "post",
            url: config.WEBHOOK_URL,
            data: { message },
            responseType: "stream"
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        response.data.on("data", (chunk) => {
            res.write(chunk.toString());
        });

        response.data.on("end", () => {
            res.end();
        });

        response.data.on("error", (err) => {
            console.error("Stream error:", err.message);
            res.end();
        });

    } catch (err) {
        console.error("Chat error:", err.response?.data || err.message);

        return res.status(500).json({
            error: "Chatbot failed to respond",
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;
