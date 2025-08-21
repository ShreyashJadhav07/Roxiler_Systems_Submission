const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const { ownerDashboard } = require("../Controller/ownerController");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["owner"]));

router.get("/dashboard", ownerDashboard);

module.exports = router;
