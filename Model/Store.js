const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,        
      maxlength: 100,      
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    address: { 
      type: String, 
      required: true,
      maxlength: 400,      
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);