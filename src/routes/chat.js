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

        const response = await axios.post(config.WEBHOOK_URL, { message });

        return res.json({ output: response.data.output });

    } catch (err) {
        console.error("Chat error:", err.response?.data || err.message);

        return res.status(500).json({
            error: "Chatbot failed to respond",
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;
