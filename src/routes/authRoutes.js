const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { createUser, findUserByEmail, findUserByUsername, findUserById } = require("../models/userModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const router = express.Router();

const SALT_ROUNDS = 12;

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: john
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       409:
 *         description: Email or username already exists
 *       422:
 *         description: Validation error
 */
router.post(
  "/register",
  authLimiter,
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters.")
      .isAlphanumeric()
      .withMessage("Username must contain only letters and numbers."),
    body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    validate,
  ],
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (findUserByEmail(email)) {
        return sendError(res, { message: "Email is already registered.", statusCode: 409 });
      }

      if (findUserByUsername(username)) {
        return sendError(res, { message: "Username is already taken.", statusCode: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = createUser(username, email, hashedPassword);
      const token = generateToken(user);

      return sendSuccess(res, {
        message: "User registered successfully.",
        statusCode: 201,
        data: { user, token },
      });
    } catch (error) {
      return sendError(res, { message: "Registration failed. Please try again." });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error
 */
router.post(
  "/login",
  authLimiter,
  [
    body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
    validate,
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = findUserByEmail(email);
      if (!user) {
        return sendError(res, { message: "Invalid email or password.", statusCode: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, { message: "Invalid email or password.", statusCode: 401 });
      }

      const token = generateToken(user);
      const { password: _, ...safeUser } = user;

      return sendSuccess(res, {
        message: "Login successful.",
        data: { user: safeUser, token },
      });
    } catch (error) {
      return sendError(res, { message: "Login failed. Please try again." });
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, (req, res) => {
  const user = findUserById(req.user.id);

  if (!user) {
    return sendError(res, { message: "User not found.", statusCode: 404 });
  }

  return sendSuccess(res, { data: { user } });
});

module.exports = router;
