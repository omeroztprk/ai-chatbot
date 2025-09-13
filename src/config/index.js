const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatbot",
    JWT_SECRET: process.env.JWT_SECRET,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN
};
