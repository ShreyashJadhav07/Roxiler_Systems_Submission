
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); 
const { getStores, submitRating, updateRating, getMyRatings, changeUserPassword } = require("../Controller/userController");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["user"]));


router.get("/stores", getStores);
router.get("/my-ratings", getMyRatings); 
router.post("/ratings", submitRating); 
router.put("/ratings/:storeId", updateRating); 
router.put("/change-password", changeUserPassword); 

module.exports = router;