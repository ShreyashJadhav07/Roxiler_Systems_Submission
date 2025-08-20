import mongoose from "mongoose";

const ratingSchema=new mongoose.Schema({
    store:{
        type: mongoose.Schema.Types.ObjectId,
         ref:"Store",
        required: true

    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    rating:{
        type: Number,
        required: true,
        min: 1,
        max:5
    }
},{timestamps:true})

export default mongoose.model("Rating", ratingSchema);