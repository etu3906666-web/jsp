// /home/forserver2/services/authService.js
import bcrypt from "bcryptjs";
import { pool } from "../db/mariadb.js";

export const checkUsernameExists = async (userID) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      "SELECT COUNT(*) AS cnt FROM UserLogin WHERE userID = ?",
      [userID]
    );
    return rows[0].cnt > 0;
  } finally {
    conn.release();
  }
};

export const registerUser = async ({ userID, password, email, phone_num }) => {
  const conn = await pool.getConnection();
  try {
    const exists = await checkUsernameExists(userID);
    if (exists) return { success: false, message: "이미 존재하는 아이디입니다." };

    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(password, salt);

    const result = await conn.query(
      `INSERT INTO UserLogin (userID, password, salt) VALUES (?, ?, ?)`,
      [userID, hashed, salt]
    );

    const member_id = result.insertId;

    await conn.query(
      `INSERT INTO UserInfo (member_id, email, phone_num)
       VALUES (?, ?, ?)`,
      [member_id, email, phone_num]
    );

    return { success: true, message: "회원가입 완료!" };

  } finally {
    conn.release();
  }
};

export const loginUser = async ({ userID, password }) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      "SELECT member_id, userID, password FROM UserLogin WHERE userID = ?",
      [userID]
    );

    if (rows.length === 0) {
      return { success: false, message: "존재하지 않는 아이디입니다." };
    }

    const user = rows[0];
    const hashed = user.password;

    const match = bcrypt.compareSync(password, hashed);
    if (!match) {
      return { success: false, message: "비밀번호가 올바르지 않습니다." };
    }

    // JWT에 넣을 최소 정보
    return {
      success: true,
      message: "로그인 성공",
      data: {
        member_id: user.member_id,
        userID: user.userID
      }
    };
  } finally {
    conn.release();
  }
};
