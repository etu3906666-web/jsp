import express from "express";
import { jwtVerify } from "../middleware/jwtVerify.js";
import {
  getFamilyInfo,
  createFamily,
  addFamilyMember,
  deleteFamily
} from "../controllers/familyController.js";

const router = express.Router();

// 가족 정보 조회
router.get("/info", jwtVerify, getFamilyInfo);

// 가족 생성
router.post("/create", jwtVerify, createFamily);

// 가족 구성원 추가
router.post("/add", jwtVerify, addFamilyMember);

// 가족 그룹 삭제
router.delete("/", jwtVerify, deleteFamily);

export default router;
