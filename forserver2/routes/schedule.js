// /routes/schedule.js
import express from "express";
import {
  getScheduleByDate,
  getManageList,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";
import { jwtVerify } from "../middleware/jwtVerify.js";

const router = express.Router();

router.get("/", jwtVerify, getScheduleByDate);
router.get("/manage", jwtVerify, getManageList);
router.post("/", jwtVerify, addSchedule);
router.put("/", jwtVerify, updateSchedule);
router.delete("/:id", jwtVerify, deleteSchedule);

export default router;
