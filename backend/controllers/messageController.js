import { redis } from "../config/redis.js";
import Chat from "../models/chat.js";
import Message from "../models/messages.js"
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.userId;
    const io = req.app.get("io");

    const { receiver, text } = req.body


    if (senderId === receiver) {
      return res.status(400).json({ error: "You cannot send message to yourself" });
    }

    if (!receiver || !text) {
      return res.status(400).json({ error: "missing receiver or text" });
    }


    const receiverUser = await User.findById(receiver);

    if (receiverUser?.isAI) {

      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiver] }
      });

if (!receiver) {
  return res.status(400).json({ message: "receiver missing" });
}



      if (!chat) {
        chat = await Chat.create({
          participants: [senderId, receiver]
        });
      }


      const userMessage = await Message.create({
        chatId: chat._id,
        senderId,
        text,
        media: []
      });

      chat.lastMessage = userMessage._id;
      await chat.save();

      const senderSocketId = await redis.get(`user:${senderId}`);

      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", userMessage);
      }

      if (senderSocketId) {
io.to(senderSocketId).emit("aiTyping", {
  chatId: chat._id,
  status: true
});
}

  const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});


      const result = await model.generateContent(text);
      const aiReply = result.response.text();

if (senderSocketId) {
 io.to(senderSocketId).emit("aiTyping", {
  chatId: chat._id,
  status: false
});
}


      const aiMessage = await Message.create({
        chatId: chat._id,
        senderId: receiver,
        text: aiReply,
        media: []
      });

      chat.lastMessage = aiMessage._id;
      await chat.save();

      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", aiMessage);
      }

      return res.status(201).json(aiMessage);
    }

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiver] }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiver]
      })
    }

    const message = await Message.create({
      chatId: chat._id,
      senderId,
      text,
      media: []
    });


    chat.lastMessage = message._id;
    await chat.save();

    const receiverSocketId = await redis.get(`user:${receiver}`);
    const senderSocketId = await redis.get(`user:${senderId}`);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message)
    }

    return res.status(201).json(message)
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: "server error in sending message" });
  }

}

export const fetchMessages = async (req, res) => {
  try {

    const chatId = req.params.chatId;

    const messages = await Message.find({
      chatId,
      deletedFor: { $ne: req.userId }
    })


    return res.status(200).json(messages);

  } catch (error) {

    return res.status(500).json({ message: "Internal server error" });
  }
};



export const sendMedia = async (req, res, next) => {
  try {
    const io = req.app.get("io");

    const media = req.files || [];

    const mediaFiles = media.map((file) => ({
      url: file.path,
      type: file.mimetype.startsWith("video/") ? "video" : "image"
    }));
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { receiver } = req.body;

    const senderId = req.userId;

    if (senderId === receiver) {
      return res.status(400).json({ error: "You cannot send message to yourself" });
    }



    if (!receiver || mediaFiles.length === 0) {
      return res.status(400).json({ error: "missing receiver" });
    }


    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiver] }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiver]
      })
    }


    const message = await Message.create({
      chatId: chat._id,
      senderId,
      text: "",
      media: mediaFiles
    });


    chat.lastMessage = message._id;
    await chat.save();
    const receiverSocketId = await redis.get(`user:${receiver}`)
    const senderSocketId = await redis.get(`user:${senderId}`)

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message)
    }


    return res.status(201).json(message);

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "server errror in sending message " })
  }
}

import mongoose from "mongoose";
import messageRouter from "../routers/messageRouter.js";

export const searchMessage = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const { query } = req.query;

    const messages = await Message.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: query,
            path: "text",
            fuzzy: {
              maxEdits: 1
            }
          }
        }
      },
      {
        $match: {
          chatId: new mongoose.Types.ObjectId(chatId)
        }
      }
    ]);


    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: "server error in searching message" });
  }
};
export const deleteMessageForMe = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const userId = req.userId
    const { selectedMessage } = req.body;
    const messageIds = selectedMessage.map(m => m._id);
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { deletedFor: userId } }
    );

    const mySocketId = await redis.get(`user:${userId}`)

    io.to(mySocketId).emit("messagesDeleted", selectedMessage);
    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "error in deleting messages" })
  }

}



export const deleteForEveryOne = async (req, res, next) => {
  try {
    const io = req.app.get("io")
    console.log("DELETE ROUTE HIT");
    const userId = req.userId;
    const { selectedMessage } = req.body;
    const isAllMessageMine = selectedMessage.every((msg) => msg.senderId.toString() === userId.toString())



    if (!isAllMessageMine) {
      return res.status(403).json({ message: "not allowed" })
    }
    const messageIds = selectedMessage.map(m => m._id);
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isDeleted: true } }
    )


    const chatId = selectedMessage[0].chatId;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "chat not found" });
    }
    const otherUserId = chat.participants.find(
      user => user.toString() !== userId.toString()
    )
    const senderSocketId = await redis.get(`user:${userId}`)
    const otherUserSocketId = await redis.get(`user:${otherUserId}`)


    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesDeletedForEveryone", selectedMessage);
    }
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("messagesDeletedForEveryone", selectedMessage);
    }

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "error in deleting messages" })
  }


}
export const deleteAllMessagesforme = async (req, res, next) => {
  try {
    const userId = req.userId
    const { chatId } = req.body
    const io = req.app.get("io")

    await Message.updateMany(
      { chatId },
      { $addToSet: { deletedFor: userId } }
    );

    const mySocketId = await redis.get(`user:${userId}`)

    io.to(mySocketId).emit("chatCleared", chatId);


    res.json({ success: true });


  } catch (error) {
    res.status(500).json({ message: "error in deleting messages" })
  }
}