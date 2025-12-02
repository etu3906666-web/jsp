// controllers/scheduleController.js
import { pool } from "../db/mariadb.js";

const TIME_TABLE = {
  DAY_1: ["09:00"],
  DAY_2: ["09:00", "18:00"],
  DAY_3: ["09:00", "13:00", "18:00"],
  DAY_4: ["09:00", "12:00", "15:00", "18:00"],
};
const WEEK_TABLE = {
  WEEK_1: [1],
  WEEK_2: [1, 4],
  WEEK_3: [1, 3, 5],
};

/* 날짜 + "HH:MM" → FULL DATETIME */
function buildFullDate(date, hhmm) {
  return `${date} ${hhmm}:00`;
}

 /* 날짜별 스케쥴 반환(회차별로 확장 후 taken 여부 포함)*/

 export async function getScheduleByDate(req, res) {
  try {
    const date = req.query.date;               // YYYY-MM-DD
    const targetId = req.query.target;
    const userId = targetId ? Number(targetId) : req.user.member_id;

    // 1) 기본 스케줄 불러오기
    const baseSql = `
      SELECT 
        s.schedule_id,
        s.m_name,
        s.cycle,
        s.method,
        DATE_FORMAT(s.start_date,'%Y-%m-%d') AS start_date,
        DATE_FORMAT(s.end_date,'%Y-%m-%d') AS end_date
      FROM Schedule s
      WHERE s.protected_id = ?
        AND DATE(s.start_date) <= ?
        AND DATE(s.end_date) >= ?
    `;

    const schedules = await pool.query(baseSql, [userId, date, date]);

    const today = new Date(date);
    const todayDay = today.getDay();

    const result = [];

    for (const s of schedules) {
      let plannedTimes = [];

      // DAILY 스케줄
      if (s.cycle.startsWith("DAY")) {
        plannedTimes = TIME_TABLE[s.cycle] || [];
      }

      // WEEKLY 스케줄
      if (s.cycle.startsWith("WEEK")) {
        if (WEEK_TABLE[s.cycle]?.includes(todayDay)) {
          plannedTimes = ["09:00"];
        }
      }

      // 각 회차별 복용 기록 확인
      for (const t of plannedTimes) {

        // 기록 조회 (date + schedule_id + planned_time)
        const rows = await pool.query(
          `
            SELECT 
              record_id,
              planned_time,
              actual_time
            FROM Record
            WHERE schedule_id = ?
              AND date = ?
              AND planned_time = ?
            LIMIT 1
          `,
          [s.schedule_id, date, t]
        );

        const taken = rows.length > 0 ? 1 : 0;
        const record_id = rows.length > 0 ? Number(rows[0].record_id) : null;

        result.push({
          schedule_id: s.schedule_id,
          m_name: s.m_name,
          method: s.method,
          planned_time: t,
          taken,
          record_id,
        });
      }
    }

    return res.json({ data: result });

  } catch (err) {
    console.error("getScheduleByDate error:", err);
    return res.status(500).json({ error: "Failed to load schedule list" });
  }
}



/** 스케쥴 관리용 */
export async function getManageList(req, res) {
  try {
    const userId = req.user.member_id;

    const sql = `
      SELECT schedule_id, m_name,
             DATE_FORMAT(start_date,'%Y-%m-%d') AS start_date,
             DATE_FORMAT(end_date,'%Y-%m-%d') AS end_date,
             cycle
      FROM Schedule
      WHERE protected_id = ?
    `;

    const rows = await pool.query(sql, [userId]);
    return res.json({ data: rows });

  } catch (err) {
    console.error("getManageList error:", err);
    res.status(500).json({ error: "Failed to load manage list" });
  }
}


/** 스케쥴 추가 */
export async function addSchedule(req, res) {
  try {
    const userId = req.user.member_id;
    const { m_name, start_date, end_date, cycle, method } = req.body;

    const sql = `
      INSERT INTO Schedule (m_name, start_date, end_date, cycle, method, protected_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      m_name, start_date, end_date, cycle, method, userId
    ]);

    return res.json({ message: "Schedule added" });

  } catch (err) {
    console.error("addSchedule error:", err);
    res.status(500).json({ error: "Failed to add schedule" });
  }
}


/** 수정 */
export async function updateSchedule(req, res) {
  try {
    const { schedule_id, m_name, start_date, end_date, cycle, method } = req.body;

    const sql = `
      UPDATE Schedule
      SET m_name=?, start_date=?, end_date=?, cycle=?, method=?
      WHERE schedule_id=?
    `;

    await pool.query(sql, [
      m_name, start_date, end_date, cycle, method, schedule_id
    ]);

    return res.json({ message: "Schedule updated" });

  } catch (err) {
    console.error("updateSchedule error:", err);
    res.status(500).json({ error: "Failed to update schedule" });
  }
}


/** 삭제 */
export async function deleteSchedule(req, res) {
  try {
    const id = req.params.id;
    await pool.query(`DELETE FROM Schedule WHERE schedule_id=?`, [id]);
    return res.json({ message: "Schedule deleted" });

  } catch (err) {
    console.error("deleteSchedule error:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
}


/** 약 복용 기록 추가 — 회차별 기록 */
export async function takeMedicine(req, res) {
  try {
    const { schedule_id, planned_time, date } = req.body;

    const now = new Date();
    const actual = now.toISOString().slice(0, 19).replace("T", " ");

    const sql = `
      INSERT INTO Record (schedule_id, date, planned_time, actual_time, status)
      VALUES (?, ?, ?, ?, 1)
    `;

    const result = await pool.query(sql, [
      schedule_id,
      date,          // ← ★ 프론트에서 준 날짜 그대로 저장
      planned_time,
      actual
    ]);

    return res.json({
      record_id: Number(result.insertId)
    });

  } catch (err) {
    console.error("takeMedicine error:", err);
    return res.status(500).json({ error: "Failed to save record" });
  }
}



export async function cancelMedicine(req, res) {
  try {
    const { record_id } = req.body;

    const sql = `DELETE FROM Record WHERE record_id=?`;
    await pool.query(sql, [record_id]);

    return res.json({ message: "Medicine cancelled" });
  } catch (err) {
    console.error("cancelMedicine error:", err);
    return res.status(500).json({ error: "Failed to cancel record" });
  }
}