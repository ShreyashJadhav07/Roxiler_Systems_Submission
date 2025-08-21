const bcrypt = require("bcryptjs");
const User = require("../Model/User");
const Store = require("../Model/Store");
const Rating = require("../Model/Rating");

const adduser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be 20-60 characters" });
    }
    
    if (address && address.length > 400) {
      return res.status(400).json({ message: "Address cannot exceed 400 characters" });
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with uppercase and special character"
      });
    }
    

    if (!["admin", "user", "owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role " });
    }

   
  } catch (error) {
    console.error("Error in adduser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const addStore = async (req, res) => {
  try {
    const { email, name, address, ownerId } = req.body;
    
   
    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: "Store name must be 2-100 characters" });
    }
    
    if (!address || address.length > 400) {
      return res.status(400).json({ message: "Address is required and max 400 characters" });
    }
  
    
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "owner") {
      return res.status(400).json({ message: "Invalid owner ID or not an owner" });
    }

    const store = new Store({
      name,
      email,
      address,
      owner: owner._id
    });
    await store.save();
    res.status(201).json({ message: "Store created successfully", store });

  } catch (error) {
    console.error("Add store error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();

    res.json({ totalUsers, totalStores, totalRatings });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    const users = await User.find(filter).sort({
      [sortBy]: order === "asc" ? 1 : -1
    });
    res.json(users);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
        $addFields: {
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: { $round: [{ $avg: "$ratings.rating" }, 2] },
              else: 0
            }
          }
        }
      },
      { $project: { ratings: 0 } },
      { $sort: { [sortBy]: order === "asc" ? 1 : -1 } }
    ]);

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userDetails = {
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

   
    if (user.role === 'owner') {
      const store = await Store.findOne({ owner: userId });
      if (store) {
        const ratings = await Rating.find({ store: store._id });
        const avgRating = ratings.length > 0 
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
          : 0;
        userDetails.rating = avgRating;
      }
    }

    res.json(userDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
