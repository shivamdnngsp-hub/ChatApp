import Chat from "../models/chat.js";
import Message from "../models/messages.js";
import User from "../models/user.js";

export const getUserChat = async (req, res) => {
  try {
    const userId = req.userId;


    const aiUser = await User.findOne({ isAI: true });

    if (aiUser) {
    
      let aiChat = await Chat.findOne({
        participants: { $all: [userId, aiUser._id] }
      });

      if (!aiChat) {
        aiChat = await Chat.create({
          participants: [userId, aiUser._id]
        });
    

      }
    }



    const chats = await Chat.find({
      participants: userId
    })
      .populate("lastMessage")
      .populate({
        path: "participants",
        select: "-password"   
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(chats);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error in fetching chats" });
  }
};





export const chatAccess = async (req, res, next) => {

  try {
console.log("here")
    const userId = req.userId;
    const {otherUserId} = req.body;
    console.log(otherUserId)
    if (!userId) {
      return res.status(400).json({ message: "user id required" })
    }

if (!otherUserId) {
  return res.status(400).json({ message: "otherUserId missing" });
}




    let chat = await Chat.findOne({
      participants: {
        $all: [userId, otherUserId]
      }
    })
      .populate("participants")
      .populate("lastMessage").select("-password");


    if (chat) {
      return res.status(200).json(chat);
    }


    const newChat = await Chat.create({
      participants: [userId, otherUserId]
    });

    const createdChat = await Chat.findById(newChat._id)
      .populate("participants")
      .populate("lastMessage").select("-password");

    return res.status(201).json(createdChat)

  } catch (error) {
    return res.status(500).json({ message: "server error in creating/fetching chat" })
  }

}



