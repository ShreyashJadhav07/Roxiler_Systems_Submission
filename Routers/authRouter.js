const express = require("express");
const { changePassword, loginHandler, signupHandler } = require("../Controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.post("/change-password", authMiddleware, changePassword);

router.post("/logout", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;




