import { pool } from "../db/mariadb.js";
import { success, fail } from "../utils/response.js";

// 기존 getMyInfo는 유지

export async function getMyInfo(req, res) {
  try {
    const member_id = req.user.member_id;

    const sql = `
      SELECT 
        U.userID,
        I.email,
        I.phone_num,
        I.family_code,
        I.role,
        I.SNS,
        I.join_date,
        I.last_login
      FROM UserLogin U
      JOIN UserInfo I ON U.member_id = I.member_id
      WHERE U.member_id = ?
    `;

    const rows = await pool.query(sql, [member_id]);

    if (!rows || rows.length === 0) {
      return fail(res, "사용자 정보가 없습니다.", 404);
    }

    return success(res, "조회 성공", rows[0]);
  } catch (err) {
    console.error("getMyInfo 오류:", err);
    return fail(res, "서버 오류", 500);
  }
}

// 가족 연동용 사용자 검색 API
// GET /api/user/search?userID=xxx
export async function searchUserForFamily(req, res) {
  try {
    const { userID } = req.query;

    if (!userID) {
      return fail(res, "userID가 필요합니다.", 400);
    }

    const rows = await pool.query(
      `SELECT U.member_id, U.userID, I.family_code, I.role
       FROM UserLogin U
       JOIN UserInfo I ON U.member_id = I.member_id
       WHERE U.userID = ?`,
      [userID]
    );

    if (!rows || rows.length === 0) {
      return success(res, "사용자를 찾을 수 없습니다.", null);
    }

    return success(res, "사용자 조회 성공", rows[0]);
  } catch (err) {
    console.error("searchUserForFamily 오류:", err);
    return fail(res, "사용자 검색 실패", 500);
  }
}
