const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const { getStores, submitRating, updateRating } = require("../Controller/userController");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["user"]));

router.get("/stores", getStores);
router.post("/rate", submitRating);
router.put("/rate/:storeId", updateRating);

module.exports = router;
