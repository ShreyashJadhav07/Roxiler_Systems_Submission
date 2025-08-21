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

export const listUsers=async (req,res) =>{
    try{
        const {name,email,address,role,sortBy="name",order="asc"}=req.query;

    let filter = {};
    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (address) filter.address = new RegExp(address, "i");
    if (role) filter.role = role;

    const users=await User.find(filter).sort({
        [sortBy]: order === "asc" ? 1 : -1 });
        res.json(users);
    } 
    catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }


};

export const listStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = "name", order = "asc" } = req.query;
    let filter = {};
    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (address) filter.address = new RegExp(address, "i");
    const stores = await Store.find(filter).sort({
      [sortBy]: order === "asc" ? 1 : -1,
    });

    const storeRatings = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ store: store._id });
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;
        return { ...store._doc, avgRating: averageRating.toFixed(2) };
      })
    );
    res.json(storeRatings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};