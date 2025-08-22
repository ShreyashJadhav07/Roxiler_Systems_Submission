const bcrypt = require("bcryptjs");
const User = require("../Model/User");
const Store = require("../Model/Store");
const Rating = require("../Model/Rating");

const adduser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    
    // Validate input
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ 
        success: false,
        message: "Name must be 20-60 characters" 
      });
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    if (address && address.length > 400) {
      return res.status(400).json({ 
        success: false,
        message: "Address cannot exceed 400 characters" 
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-16 characters with uppercase and special character"
      });
    }
    
    if (!role || !["admin", "user", "owner"].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role. Must be admin, user, or owner" 
      });
    }

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      address,
      password: hashedPassword,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("Error in adduser:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

const addStore = async (req, res) => {
  try {
    const { email, name, address, ownerId } = req.body;
    
    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({ 
        success: false,
        message: "Store name must be 2-100 characters" 
      });
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    if (!address || address.length > 400) {
      return res.status(400).json({ 
        success: false,
        message: "Address is required and max 400 characters" 
      });
    }
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required"
      });
    }
    
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "owner") {
      return res.status(400).json({ 
        success: false,
        message: "Invalid owner ID or user is not an owner" 
      });
    }

   
    const existingStore = await Store.findOne({ owner: ownerId });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "This owner already has a store"
      });
    }

    const store = new Store({
      name,
      email,
      address,
      owner: owner._id
    });
    
    await store.save();
    
    res.status(201).json({ 
      success: true,
      message: "Store created successfully", 
      data: store 
    });

  } catch (error) {
    console.error("Add store error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();

    res.json({ 
      success: true,
      data: {
        totalUsers, 
        totalStores, 
        totalRatings 
      }
    });

  } catch (error) {
    console.error("Error in getDashboard:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = "name", order = "asc" } = req.query;

    let filter = {};
    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (address) filter.address = new RegExp(address, "i");
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password') 
      .sort({
        [sortBy]: order === "asc" ? 1 : -1
      });
      
    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error("Error in listUsers:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

const listStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = "name", order = "asc" } = req.query;

    let matchFilter = {};
    if (name) matchFilter.name = new RegExp(name, "i");
    if (email) matchFilter.email = new RegExp(email, "i");
    if (address) matchFilter.address = new RegExp(address, "i");

    const stores = await Store.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "store",
          as: "ratings"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails"
        }
      },
      {
        $addFields: {
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: { $round: [{ $avg: "$ratings.rating" }, 2] },
              else: 0
            }
          },
          ownerName: { $arrayElemAt: ["$ownerDetails.name", 0] }
        }
      },
      { 
        $project: { 
          ratings: 0, 
          ownerDetails: 0 
        } 
      },
      { $sort: { [sortBy]: order === "asc" ? 1 : -1 } }
    ]);

    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error("Error in listStores:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    let userDetails = {
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    
    if (user.role === 'owner') {
      const store = await Store.findOne({ owner: userId });
      if (store) {
        const ratings = await Rating.find({ store: store._id });
        const avgRating = ratings.length > 0 
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
          : 0;
        userDetails.store = {
          id: store._id,
          name: store.name,
          address: store.address,
          email: store.email,
          avgRating: parseFloat(avgRating)
        };
      }
    }

   
    if (user.role === 'user') {
      const ratingCount = await Rating.countDocuments({ user: userId });
      userDetails.totalRatings = ratingCount;
    }

    res.json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
  adduser,
  addStore,
  getDashboard,
  listUsers,
  listStores,
  getUserDetails
};