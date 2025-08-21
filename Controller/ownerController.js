import Rating from "../Model/Rating";
import Store from "../Model/Store"

export const ownerDashboard=async (req, res) => {
    try{
        const store=await Store.findOne({owner: req.user._id});
        if(!store){
            return res.status(404).json({
                message: "Store not found for this owner"
            })
        }

        const ratings= await Rating.find({
            store: store._id
        }).populate("user", "name email");

        const avgRating = ratings.length > 0
        ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;
        res.json({
            store:{
                id: store._id,
                name: store.name,
                address: store.address,
                email: store.email,
            },
            avgRating: avgRating.toFixed(2),
            ratings: ratings.map(r => ({
                userName: r.user.name,
                userEmail: r.user.email,
                rating: r.rating,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}