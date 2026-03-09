import express from "express"
import { chatAccess, getUserChat } from "../controllers/chatsController.js";
import protect from "../middleware/protect.js";
const chatsRouter = express.Router();
chatsRouter.get("/fetchchats",protect,getUserChat)
chatsRouter.post("/findChat",protect,chatAccess )
export default chatsRouter;