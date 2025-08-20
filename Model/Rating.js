import mongoose from "mongoose";

const ratingSchema=new mongoose.Schema({
    store;{
        type: mongoose.Schema.Types.ObjectId,
         ref:"Store",
        required: true

    }