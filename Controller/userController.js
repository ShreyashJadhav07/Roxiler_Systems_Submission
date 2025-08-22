const bcrypt = require("bcryptjs");
const Rating = require("../Model/Rating");
const Store = require("../Model/Store");
const User = require("../Model/User");

const getStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    let query = {};

    if (name) query.name = new RegExp(name, "i");
    if (address) query.address = new RegExp(address, "i");

   
    const stores = await Store.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "store",
          as: "ratings"
        }
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: { $round: [{ $avg: "$ratings.rating" }, 1] },
              else: null
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          email: 1,
          averageRating: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error("Error in getStores:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching stores", 
      error: error.message 
    });
  }
};

const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user.id })
      .populate('store', 'name address');

    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error("Error in getMyRatings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ratings",
      error: error.message
    });
  }
};

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ 
        success: false,
        message: "Store ID and rating are required" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "Rating must be between 1 and 5" 
      });
    }

  
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    
    const existingRating = await Rating.findOne({
      store: storeId,
      user: req.user.id,
    });

    if (existingRating) {
      return res.status(400).json({ 
        success: false,
        message: "You have already rated this store. Use update instead." 
      });
    }

    const newRating = new Rating({
      store: storeId,
      user: req.user.id,
      rating,
    });

    await newRating.save();
    res.status(201).json({ 
      success: true,
      message: "Rating submitted successfully",
      data: newRating
    });
  } catch (error) {
    console.error("Error in submitRating:", error);
    res.status(500).json({ 
      success: false,
      message: "Error submitting rating", 
      error: error.message 
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const { storeId } = req.params;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "Rating must be between 1 and 5" 
      });
    }

    const updated = await Rating.findOneAndUpdate(
      { store: storeId, user: req.user.id },
      { rating },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Rating not found for this store"
      });
    }

    res.json({ 
      success: true,
      message: "Rating updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.error("Error in updateRating:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating rating", 
      error: error.message 
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }


    const user = await User.findById(req.user.id);
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
    console.error("Error in changeUserPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = { 
  getStores, 
  submitRating, 
  updateRating, 
  getMyRatings, 
  changeUserPassword 
};