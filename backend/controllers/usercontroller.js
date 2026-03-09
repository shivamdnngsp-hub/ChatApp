import { redis } from "../config/redis.js";
import User from "../models/user.js";

export const fetchUser = async (req,res,next)=>{


try {
    const userId = req.userId;

 const foundUser = await User
      .findById(userId)
      .select("-password");


if(!foundUser){
    return res.status(500).json({message:"user not authenticated"})
}
 return res.status(200).json(foundUser);

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


export const fetchAllUser =async  (req,res,next)=>{
try {
  
const users = await User.find({
  _id: { $ne: req.userId }
}).select("-password");

return res.status(200).json(users)

} catch (error) {
  return res.status(500).json({message:"server error in fetching user"})
}

}
export const fetchonlineUser = async (req,res,next)=>{
  try {
    const onlineUsers  = await redis.smembers("onlineUsers")
    console.log("here")
    console.log(onlineUsers)
    return res.status(200).json(onlineUsers)
  } catch (error) {
    return res.status(500).json("server error in fetching the online users")
  }

}


