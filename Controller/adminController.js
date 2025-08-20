import bcrypt from "bcryptjs";
import User from "../Model/User";


export const adduser=async(req,res)=>{
    try{
        const {name,email,address,password,role}=req.body;
        if(!["admin" , "user" , "owner"] .includes(role)){
            return res.status(400).json({message : "Invalid role "});
        }
        const existing=await User.findOne({
            email: email
        });

        if(existing){
            return res.status(400).json({
                message:"User already exists"
            })

        }
        const  handlePassword=await bcrypt.hash(password,10);

        const user=new User({
            name,
            email,
            address,
            password: handlePassword,
            role
        });
        await user.save();
        res.status(201).json({
            message:"User added succesfully", user
        });



    } catch(error){

        console.error("Error in adduser:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}