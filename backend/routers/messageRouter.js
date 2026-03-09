import express from "express"
import protect from "../middleware/protect.js";
import {  deleteAllMessagesforme, deleteForEveryOne, deleteMessageForMe, fetchMessages, searchMessage, sendMedia, sendMessage } from "../controllers/messageController.js";
import upload from "../config/multer.js";
const messageRouter = express.Router();
messageRouter.post("/send",protect,sendMessage)
messageRouter.post("/send-media",protect,upload.array("media",5),sendMedia)
messageRouter.get("/fetchmessage/:chatId",protect,fetchMessages)
messageRouter.get("/search/:chatId",searchMessage)
messageRouter.delete("/deleteforme",protect,deleteMessageForMe)
messageRouter.delete("/deleteforeveryone",protect,deleteForEveryOne)
messageRouter.delete("/deleteallforme",protect,deleteAllMessagesforme)

export default messageRouter