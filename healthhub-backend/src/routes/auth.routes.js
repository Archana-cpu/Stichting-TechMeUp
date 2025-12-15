const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const meController = require("../controllers/me.controller");
const { authRequired } = require("../middlewares/authRequired");

router.post("/register", authController.register);
router.post("/login", authController.login);

// protected
router.get("/me", authRequired, meController.me);

module.exports = router;
