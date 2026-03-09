import express from "express"
import { login, logout, RefreshToken,  signup } from "../controllers/authController.js";
import { loginValidtor, signupValidator } from "../validators/Validator.js";
import { validate } from "../middleware/validate.js";
import protect from "../middleware/protect.js";
const authRouter = express.Router();

authRouter.post("/signup",signupValidator ,validate,signup)
authRouter.post("/login",loginValidtor,validate,login)
authRouter.post("/logout", protect ,logout)
authRouter.post("/refresh",RefreshToken)

export default authRouter