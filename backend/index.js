import dotenv from "dotenv";
dotenv.config();
import express from "express"
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routers/authRouter.js";
import cors from "cors";
import userRouter from "./routers/userRouter.js";
import { connectRedis, redis } from "./config/redis.js"
import messageRouter from "./routers/messageRouter.js";
import chatsRouter from "./routers/chatRouter.js";
import serachRouter from "./routers/searchRouter.js";
import http, { createServer } from "http";
import { Server } from "socket.io";
import Message from "./models/messages.js";
import Chat from "./models/chat.js";


const app = express();


const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:5173"
  ],
  credentials: true
}));

;


app.use(cookieParser());
app.use(express.json())



app.get("/", (req, res, next) => {
  res.send("hello from server")
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/chats", chatsRouter)
app.use("/api/messages", messageRouter)
app.use("/api/search", serachRouter)


const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});
app.set("io", io)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async (userId) => {
    socket.userId = userId
    await redis.set(`user:${userId}`, socket.id);

    await redis.sadd("onlineUsers", userId);

    socket.broadcast.emit("userOnline", userId);
  });

  socket.on("seenMessages", async ({ chatId }) => {

    const myId = socket.userId;
   
    if (!myId) {
      return;
    }

    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: myId },
        seen: false
      },
      { $set: { seen: true } }
    );

 const chat = await Chat.findById(chatId);
if (!chat) return;

const otherUserId = chat.participants.find(
  (id) => id.toString() !== myId.toString()
);

const senderSocket = await redis.get(`user:${otherUserId?.toString()}`);
 console.log("MyId:", myId);
  console.log("OtherUserId:", otherUserId?.toString());
  console.log("SenderSocket:", senderSocket);


if (senderSocket) {
  io.to(senderSocket).emit("messagesSeen", { chatId });
}



  })



  socket.on("disconnect", async () => {
    const keys = await redis.keys("user:*");

    for (const key of keys) {
      const socketId = await redis.get(key);

      if (socketId === socket.id) {
        const userId = key.split(":")[1];

        await redis.del(key);
        await redis.srem("onlineUsers", userId);

        socket.broadcast.emit("userOffline", userId);
        break;
      }
    }

    console.log("User disconnected:", socket.id);
  });



});





server.listen(port, () => {
  connectRedis();
  connectDb()
  console.log(`Server running at http://localhost:${port}`);
})

