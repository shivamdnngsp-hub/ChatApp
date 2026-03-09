import mongoose from "mongoose";
import User from "../models/user.js";

export const showResult = async (req, res) => {
  try {

    const { q } = req.query;
    const loggedInUserId = req.userId;

    if (!q) {
      return res.json([]);
    }

    const users = await User.aggregate([

      {
        $search: {
          index: "default",
          autocomplete: {
            query: q,
            path: "userName"
          }
        }
      },

     
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId) }
        }
      },

    
      {
        $limit: 10
      },

    
      {
        $project: {
          password: 0,
          __v: 0
        }
      }

    ]);

    return res.status(200).json(users);

  } catch (error) {

    console.log("Search Error:", error);
    return res.status(500).json({ message: "Server error in fetching users" });

  }
};
