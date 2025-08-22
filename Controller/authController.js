const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../Model/User");

const promisify = util.promisify;
const promisifiedJWTsign = promisify(jwt.sign);

const { JWT_SECRET_KEY } = process.env;

const signupHandler = async (req, res) => {
  try {
   
    const { name, email, address, password, role } = req.body;

  
    console.log("Signup request data:", { name, email, address, role });

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and include at least one uppercase letter and one special character.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
      name,
      email,
      address,
      password: hashedPassword,
      role: role || "user",
    });

    console.log("Creating user with role:", role); 

    await user.save();
    
    console.log("User created successfully with role:", user.role); 
    
    res.status(201).json({ 
      message: "Signup successful", 
      status: "success" 
    });
  } catch (error) {
    console.error("Error in signupHandler:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  
    const authToken = await promisifiedJWTsign(
      { id: user._id, role: user.role },
      JWT_SECRET_KEY
    );

    res.cookie("jwt", authToken, {
      maxAge: 1000 * 60 * 60 * 24,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login successful",
      status: "success",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error in loginHandler:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters, include one uppercase and one special char",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signupHandler, loginHandler, changePassword };