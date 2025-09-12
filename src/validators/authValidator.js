const { body } = require("express-validator");

const authValidator = {
    register: [
        body("firstName")
            .trim()
            .notEmpty().withMessage("First name is required")
            .isLength({ min: 2, max: 25 }).withMessage("First name must be between 2 and 25 characters"),

        body("lastName")
            .trim()
            .notEmpty().withMessage("Last name is required")
            .isLength({ min: 2, max: 25 }).withMessage("Last name must be between 2 and 25 characters"),

        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Please provide a valid email")
            .normalizeEmail(),

        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/\d/).withMessage("Password must contain at least one number")
            .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character")
    ],

    login: [
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Please provide a valid email")
            .normalizeEmail(),

        body("password")
            .notEmpty().withMessage("Password is required")
    ]
};

module.exports = authValidator;
