import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";

const protect = async (req, res, next) => {
  try {

  
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

   
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const userId = decoded.userId;

    
    const savedToken = await redis.get(`access:${userId}`);// to prevent 2 login session

    if (!savedToken || savedToken !== token) {
      return res.status(401).json({ message: "Session expired or replaced" });
    }

   
    const session = await redis.get(`session:${userId}`);

    if (!session) {
      return res.status(401).json({ message: "Session expired. Please login again" });
    }

    
    req.userId = userId;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;
