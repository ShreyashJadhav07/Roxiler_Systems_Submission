import bcrypt from "bcryptjs";
import User from "../Model/User";
import Store from "../Model/Store";
import Rating from "../Model/Rating";


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

export const addStore= async(req,res)=>{
        try{
            const {email, name, address,ownerId}=req.body;
            const owner=await User.findById(ownerId);
            if(!owner || owner.role !== "owner"){
                return res.status(400).json({ message: "Invalid owner ID or not an owner" });
            }
            const store=new Store({
                name,
                email,
                address,
                owner: owner._id
            });
            await store.save();
            res.status(201).json({ message: "Store created successfully", store });


        }
       catch (error) {
    console.error("Add store error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getDashboard= async (req, res) => {
    try{

        const  totalUsers=await User.countDocuments();
        const totalStores=await Store.countDocuments();
        const totalRatings=await Rating.countDocuments();
        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });

    }
     catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}