
const express = require("express");
const { addStore, adduser, getDashboard, listStores, listUsers, getUserDetails } = require("../Controller/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


router.use(authMiddleware, roleMiddleware(["admin"]));


router.post("/add-user", adduser);
router.post("/add-store", addStore);
router.get("/dashboard-stats", getDashboard); 
router.get("/users", listUsers);
router.get("/stores", listStores);
router.get("/users/:userId", getUserDetails);

module.exports = router;