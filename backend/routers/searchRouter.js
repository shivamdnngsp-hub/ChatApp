import express from "express"
import { showResult } from "../controllers/searchcontroller.js"
import protect from "../middleware/protect.js"
const serachRouter = express.Router()
serachRouter.get("/input",protect,showResult)
export default serachRouter