const jwt = require("jsonwebtoken");
const Session = require("../models/session");
const config = require("../config");

async function auth(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token required" });

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const session = await Session.findOne({
            userId: decoded.userId,
            jti: decoded.jti,
            revoked: false,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(401).json({ error: "Token revoked or expired" });
        }

        req.user = decoded;
        req.auth = { jti: decoded.jti };
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = auth;
