const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in environment variables.");

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    secret,
    { expiresIn }
  );
}

async function register({ email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error("Email already in use.");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), passwordHash });

  const token = signToken(user);

  return {
    token,
    user: { id: user._id.toString(), email: user.email },
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user);

  return {
    token,
    user: { id: user._id.toString(), email: user.email },
  };
}

module.exports = { register, login };
