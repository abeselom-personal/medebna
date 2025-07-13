import * as express from "express";
const userRouter = express.Router();
import { storeUserInfo } from "../../controller/user/userController.js";

userRouter.post('/user', storeUserInfo);

module.exports = userRouter;
