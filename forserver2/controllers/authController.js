// /home/forserver2/controllers/authController.js
import { success, fail } from "../utils/response.js";
import {
  registerUser,
  loginUser,
  checkUsernameExists,
  changePassword
} from "../services/authService.js";
import { signToken } from "../utils/jwt.js";

export const handleRegister = async (req, res) => {
  const result = await registerUser(req.body);

  if (!result.success) return fail(res, result.message);
  return success(res, result.message);
};

export const handleLogin = async (req, res) => {
  const result = await loginUser(req.body);

  if (!result.success) return fail(res, result.message, 401);

  const { member_id, userID } = result.data;

  // JWT 생성
  const token = signToken({ member_id, userID });

  return success(res, result.message, {
    member_id,
    userID,
    token
  });
};

export const handleCheckUsername = async (req, res) => {
  const { userID } = req.query;

  if (!userID) return fail(res, "userID가 필요합니다.");

  const exists = await checkUsernameExists(userID);
  return success(res, "조회 완료", { exists });
};

export const handleChangePassword = async (req, res) => {
  const result = await changePassword(req.body);

  if (!result.success) return fail(res, result.message, 401);
  return success(res, result.message);
};
