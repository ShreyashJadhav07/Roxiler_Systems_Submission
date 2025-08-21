const Rating = require("../Model/Rating");
const Store = require("../Model/Store");


const getStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    let query = {};

    if (name) query.name = new RegExp(name, "i");
    if (address) query.address = new RegExp(address, "i");

    const stores = await Store.find(query);

    const storeData = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ store: store._id });
        const avg =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        const userRating = await Rating.findOne({
          store: store._id,
          user: req.user.id,
        });

        return {
          id: store._id,
          name: store.name,
          address: store.address,
          avgRating: avg.toFixed(2),
          userRating: userRating ? userRating.rating : null,
        };
      })
    );

    res.json(storeData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stores", error: err.message });
  }
};

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1 to 5" });
    }

  
    const existingRating = await Rating.findOne({
      store: storeId,
      user: req.user.id,
    });

    if (existingRating) {
      return res.status(400).json({ 
        message: "You have already rated this store. Use update instead." 
      });
    }


    const newRating = new Rating({
      store: storeId,
      user: req.user.id,
      rating,
    });

    await newRating.save();
    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting rating", error: error.message });
  }
};
const updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const { storeId } = req.params;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1 to 5" });
    }

    const updated = await Rating.findOneAndUpdate(
      { store: storeId, user: req.user.id },
      { rating },
      { new: true }
    );

    res.json({ message: "Rating updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating rating", error: err.message });
  }
};

module.exports = { getStores, submitRating, updateRating };
