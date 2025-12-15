const User = require("../models/User");

async function me(req, res, next) {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select("_id email createdAt updatedAt");
    if (!user) return res.status(404).json({ error: "User not found." });

    return res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { me };
