import express from "express"
import protect from "../middleware/protect.js"
import { fetchAllUser, fetchonlineUser, fetchUser } from "../controllers/usercontroller.js"
const userRouter = express.Router()

userRouter.get("/me",protect, fetchUser)
userRouter.get("/getalluser",protect,fetchAllUser)
userRouter.get("/online", fetchonlineUser)
export default userRouter