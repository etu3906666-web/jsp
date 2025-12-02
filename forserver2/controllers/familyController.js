// /controllers/familyController.js
import { pool } from "../db/mariadb.js";
import { success, fail } from "../utils/response.js";

/**
 * 가족 정보 조회
 * GET /api/family/info
 */
export async function getFamilyInfo(req, res) {
  try {
    const member_id = req.user.member_id;

    const [user] = await pool.query(
      "SELECT family_code, role FROM UserInfo WHERE member_id = ?",
      [member_id]
    );

    // UserInfo 자체가 없거나 family_code가 없는 경우 → 초기 상태
    if (!user || user.family_code === null) {
      return success(res, "가족 없음", null);
    }

    const [familyInfo] = await pool.query(
      "SELECT protector_id FROM Family WHERE family_code = ?",
      [user.family_code]
    );

    if (!familyInfo) {
      return success(res, "가족 없음", null);
    }

    const [protector] = await pool.query(
      "SELECT userID FROM UserLogin WHERE member_id = ?",
      [familyInfo.protector_id]
    );

    let children = [];

    // 내가 보호자인 경우에만 피보호자 목록 조회
    if (user.role === 1) {
      children = await pool.query(
        `SELECT U.member_id, U.userID
         FROM UserLogin U
         JOIN UserInfo I ON U.member_id = I.member_id
         WHERE I.family_code = ? AND I.role = 0`,
        [user.family_code]
      );
    }

    return success(res, "가족 조회 성공", {
      hasFamily: true,
      role: user.role,
      protector: {
        member_id: familyInfo.protector_id,
        userID: protector?.userID || null
      },
      children
    });
  } catch (err) {
    console.error("getFamilyInfo 오류:", err);
    return fail(res, "가족 조회 실패", 500);
  }
}

/**
 * 가족 그룹 생성
 * POST /api/family/create
 * - 호출자는 보호자가 되고
 * - Family 테이블에 새로운 family_code 생성
 */
export async function createFamily(req, res) {
  try {
    const member_id = req.user.member_id;

    const [user] = await pool.query(
      "SELECT family_code, role FROM UserInfo WHERE member_id = ?",
      [member_id]
    );

    if (!user) {
      return fail(res, "UserInfo가 없습니다.", 400);
    }

    if (user.family_code !== null) {
      return fail(res, "이미 가족에 소속되어 있습니다.", 400);
    }

    const result = await pool.query(
      "INSERT INTO Family (protector_id) VALUES (?)",
      [member_id]
    );
    const family_code = result.insertId;

    await pool.query(
      "UPDATE UserInfo SET family_code = ?, role = 1 WHERE member_id = ?",
      [family_code, member_id]
    );

    return success(res, "가족 그룹 생성 완료", { family_code });
  } catch (err) {
    console.error("createFamily 오류:", err);
    return fail(res, "가족 생성 실패", 500);
  }
}

/**
 * 가족 구성원 추가
 * POST /api/family/add
 * body: { targetMemberId: number, makeTargetProtector?: boolean }
 */
export async function addFamilyMember(req, res) {
  try {
    const myId = req.user.member_id;
    const { targetMemberId, makeTargetProtector } = req.body;

    if (!targetMemberId) {
      return fail(res, "targetMemberId가 필요합니다.", 400);
    }
    if (targetMemberId === myId) {
      return fail(res, "자기 자신은 추가할 수 없습니다.", 400);
    }

    // 나의 정보
    const [me] = await pool.query(
      "SELECT family_code, role FROM UserInfo WHERE member_id = ?",
      [myId]
    );
    if (!me) return fail(res, "내 UserInfo가 없습니다.", 400);

    // 대상 유저 정보
    const [target] = await pool.query(
      `SELECT U.member_id, U.userID, I.family_code, I.role
       FROM UserLogin U
       JOIN UserInfo I ON U.member_id = I.member_id
       WHERE U.member_id = ?`,
      [targetMemberId]
    );
    if (!target) return fail(res, "대상 사용자가 존재하지 않습니다.", 404);

    // 보호자-보호자 연결은 금지
    if (me.role === 1 && target.role === 1) {
      return fail(res, "보호자끼리는 가족으로 연결할 수 없습니다.", 400);
    }

    // 이미 가족 소속인 대상(보호자든 피보호자든)을 새 가족으로 편입하는 것은 제한
    // (필요하면 정책에 맞게 수정)
    if (me.role === 1) {
      // 나는 보호자
      if (target.family_code !== null) {
        return fail(res, "대상 사용자는 이미 다른 가족에 소속되어 있습니다.", 400);
      }

      // 대상은 내 가족의 피보호자
      await pool.query(
        "UPDATE UserInfo SET family_code = ?, role = 0 WHERE member_id = ?",
        [me.family_code, target.member_id]
      );

      return success(res, "피보호자 추가 완료", null);
    }

    // 나는 피보호자
    if (me.role === 0) {
      // 이미 가족에 속한 피보호자는 추가 기능 없음
      if (me.family_code !== null) {
        return fail(res, "이미 가족에 소속된 피보호자는 구성원 추가를 할 수 없습니다.", 400);
      }

      // 대상이 보호자인 경우 → 대상 가족에 피보호자로 편입
      if (target.role === 1 && target.family_code !== null) {
        await pool.query(
          "UPDATE UserInfo SET family_code = ?, role = 0 WHERE member_id = ?",
          [target.family_code, myId]
        );
        return success(res, "보호자 가족에 편입되었습니다.", null);
      }

      // 둘 다 피보호자이고 가족 없음 → 보호자 선택 필요
      if (
        target.role === 0 &&
        target.family_code === null &&
        me.family_code === null
      ) {
        if (typeof makeTargetProtector !== "boolean") {
          return fail(
            res,
            "피보호자끼리 연결 시 보호자를 선택해야 합니다.",
            400
          );
        }

        // 트랜잭션 없이 단순 순차 쿼리 (간단히 처리)
        if (makeTargetProtector) {
          // 상대를 보호자로 설정
          const result = await pool.query(
            "INSERT INTO Family (protector_id) VALUES (?)",
            [target.member_id]
          );
          const family_code = result.insertId;

          await pool.query(
            "UPDATE UserInfo SET family_code = ?, role = 1 WHERE member_id = ?",
            [family_code, target.member_id]
          );
          await pool.query(
            "UPDATE UserInfo SET family_code = ?, role = 0 WHERE member_id = ?",
            [family_code, myId]
          );
        } else {
          // 나를 보호자로 설정
          const result = await pool.query(
            "INSERT INTO Family (protector_id) VALUES (?)",
            [myId]
          );
          const family_code = result.insertId;

          await pool.query(
            "UPDATE UserInfo SET family_code = ?, role = 1 WHERE member_id = ?",
            [family_code, myId]
          );
          await pool.query(
            "UPDATE UserInfo SET family_code = ?, role = 0 WHERE member_id = ?",
            [family_code, target.member_id]
          );
        }

        return success(res, "새 가족 그룹이 생성되었습니다.", null);
      }

      // 그 외 케이스 (대상이 이미 가족 있음 등)
      return fail(res, "이 사용자는 가족으로 추가할 수 없습니다.", 400);
    }

    // role이 0/1 이외 값인 경우
    return fail(res, "유효하지 않은 역할(role)입니다.", 400);
  } catch (err) {
    console.error("addFamilyMember 오류:", err);
    return fail(res, "가족 추가 실패", 500);
  }
}

/**
 * 가족 그룹 삭제 (보호자만 가능)
 * DELETE /api/family
 * - 해당 family_code의 모든 구성원: family_code=NULL, role=0
 * - Family 테이블 row 삭제
 */
export async function deleteFamily(req, res) {
  try {
    const member_id = req.user.member_id;

    const [user] = await pool.query(
      "SELECT family_code, role FROM UserInfo WHERE member_id = ?",
      [member_id]
    );

    if (!user || user.family_code === null) {
      return fail(res, "가족에 소속되어 있지 않습니다.", 400);
    }

    if (user.role !== 1) {
      return fail(res, "가족 삭제는 보호자만 가능합니다.", 403);
    }

    const family_code = user.family_code;

    // 모든 구성원 초기화
    await pool.query(
      "UPDATE UserInfo SET family_code = NULL, role = 0 WHERE family_code = ?",
      [family_code]
    );

    // Family row 삭제
    await pool.query(
      "DELETE FROM Family WHERE family_code = ?",
      [family_code]
    );

    return success(res, "가족 그룹이 삭제되었습니다.", null);
  } catch (err) {
    console.error("deleteFamily 오류:", err);
    return fail(res, "가족 삭제 실패", 500);
  }
}
