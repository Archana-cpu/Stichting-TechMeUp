const authService = require("../services/auth.service");

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.length <= 254;
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email." });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const result = await authService.register({ email, password });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
