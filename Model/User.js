import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        requires:true,
        minlength:20,
        maxlength:60
,    }
})