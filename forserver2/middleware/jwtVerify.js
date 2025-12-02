// /home/forserver2/middleware/jwtVerify.js
import { verifyToken } from "../utils/jwt.js";
import { fail } from "../utils/response.js";

export function jwtVerify(req, res, next) {
  const authHeader = req.headers.authorization || "";

  // Authorization: Bearer <token>
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return fail(res, "인증 토큰이 없습니다.", 401);
  }

  try {
    const decoded = verifyToken(token);
    // 이후 핸들러에서 쓸 수 있게 req.user에 저장
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT 검증 실패:", err.message);
    return fail(res, "유효하지 않거나 만료된 토큰입니다.", 401);
  }
}
