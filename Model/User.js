import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        requires:true,
        minlength:20,
        maxlength:60
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]

    },

    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:16,
         match: [
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])/, 
        "Password must be 8-16 characters and include at least one uppercase letter and one special character."
    ]
    },

    address:{
        type:String,
        maxlength:400
        
    },
    role:{
        type:String,
        enum:["admin", "user", "owner"],
        default:"user"

    }


},{timestamps:true})

export default mongoose.model("User", userSchema);