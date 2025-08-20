import jwt from "jsonwebtoken";
import User from "../Model/User";


export const authMiddleware = async (req, res, next) => {
  try {
  
    let token = req.cookies?.jwt || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Token verification failed" });
  }
};
