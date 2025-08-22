
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Fixed import
const { ownerDashboard, changeOwnerPassword } = require("../Controller/ownerController");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["owner"]));

router.get("/dashboard", ownerDashboard);
router.put("/change-password", changeOwnerPassword); // Add password change for owners

module.exports = router;