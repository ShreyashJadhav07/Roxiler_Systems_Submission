const bcrypt = require("bcryptjs");
const Rating = require("../Model/Rating");
const Store = require("../Model/Store");
const User = require("../Model/User");

const ownerDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found for this owner"
      });
    }

    const ratings = await Rating.find({
      store: store._id
    }).populate("user", "name email");

   
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          address: store.address,
          email: store.email,
        },
        avgRating: parseFloat(avgRating.toFixed(2)),
        ratings: ratings.map(r => ({
          id: r._id,
          userName: r.user.name,
          userEmail: r.user.email,
          rating: r.rating,
          createdAt: r.createdAt,
        })),
      }
    });
  } catch (error) {
    console.error("Error in ownerDashboard:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

const changeOwnerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }


    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

   
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

 
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-16 characters with at least one uppercase letter and one special character"
      });
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Error in changeOwnerPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = { ownerDashboard, changeOwnerPassword };