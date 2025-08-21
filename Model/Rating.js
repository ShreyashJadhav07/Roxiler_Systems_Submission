const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);


ratingSchema.index({ store: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
