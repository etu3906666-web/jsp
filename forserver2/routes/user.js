// /home/forserver2/routes/user.js
import express from "express";
import { jwtVerify } from "../middleware/jwtVerify.js";
import { getMyInfo, searchUserForFamily } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", jwtVerify, getMyInfo);
router.get("/search", jwtVerify, searchUserForFamily);

export default router;
