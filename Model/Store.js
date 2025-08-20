import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
        
    },
     address: { type: String, 
        required: true 
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },



    },{timestamps: true});


export default mongoose.model("Store", storeSchema);