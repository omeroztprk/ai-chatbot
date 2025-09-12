const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const Session = require("../models/session");
const auth = require("../middleware/auth");
const authValidator = require("../validators/authValidator");
const validationHandler = require("../middleware/validationHandler");
const config = require("../config");

const router = express.Router();

router.post("/register", authValidator.register, validationHandler, async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const user = new User({ firstName, lastName, email, password });
        await user.save();

        res.status(201).json(user.toJSON());
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: "Email already exists" });
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post("/login", authValidator.login, validationHandler, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const jti = crypto.randomUUID();
        const expiresIn = "1h";

        const token = jwt.sign(
            { userId: user._id, email: user.email, jti },
            config.JWT_SECRET,
            { expiresIn }
        );

        const decoded = jwt.decode(token);

        await Session.create({
            userId: user._id,
            jti,
            expiresAt: new Date(decoded.exp * 1000)
        });

        res.json({ user: user.toJSON(), token });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

router.post("/logout", auth, async (req, res) => {
    try {
        await Session.updateOne({ jti: req.auth.jti }, { revoked: true });
        res.json({ message: "Logged out" });
    } catch {
        res.status(500).json({ error: "Logout failed" });
    }
});

module.exports = router;
