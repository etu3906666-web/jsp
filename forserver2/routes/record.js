// /routes/record.js
import express from "express";
import { jwtVerify } from "../middleware/jwtVerify.js";
import {
  takeMedicine,
  cancelMedicine,
} from "../controllers/scheduleController.js";

const router = express.Router();

// 약 복용 체크 / 취소
router.post("/take", jwtVerify, takeMedicine);
router.post("/cancel", jwtVerify, cancelMedicine);

export default router;
