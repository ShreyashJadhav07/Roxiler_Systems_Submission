import Store from "../Model/Store";



import Store from "../Model/Store";
import Rating from "../Model/Rating";

export const listStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    let filter = {};
    if (name) filter.name = new RegExp(name, "i");
    if (address) filter.address = new RegExp(address, "i");

    const stores = await Store.find(filter);
    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ store: store._id });

        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        let userRating = null;
        if (req.user) {
          const rating = await Rating.findOne({
            user: req.user._id,
            store: store._id,
          });
          if (rating) {
            userRating = rating.rating;
          }
        }
        return {
          ...store._doc,
          avgRating: avgRating.toFixed(2),
          userRating,
        };
      })
    );
    res.json(storesWithRatings);
  } catch (error) {
    console.error("Error listing stores:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const submitRating = async (req, res) => {
    try{
        const { storeId} = req.params;
        const { rating } = req.body;
         if(rating  < 1 || rating > 5){
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
         }

         let existingRating = await Rating.findOne({
            user: req.user._id,
            store: storeId
         });
            if (existingRating) {
      return res.status(400).json({ message: "You already rated this store. Use update instead." });
    }

    const newRating =new Rating({
        store: storeId,
        user: req.user._id,
        rating,
    });
    await newRating.save();
    res.status(201).json({ message: "Rating submitted successfully" , rating: newRating});

                
    }
     catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateRating = async (req, res) => {
    try{
        const { storeId } = req.params;
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const existingRating = await Rating.findOne({
            user: req.user._id,
            store: storeId
        });
        if (!existingRating) {
            return res.status(404).json({ message: "Rating not found" });
        }
        existingRating.rating = rating;
        await existingRating.save();

        res.status(200).json({ message: "Rating updated successfully", rating: existingRating });
    } catch (error) {
        console.error("Error updating rating:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};