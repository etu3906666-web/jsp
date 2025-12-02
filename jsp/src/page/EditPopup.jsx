// src/components/EditPopup.jsx (또는 Calendar 폴더 내)
import React, { useState } from "react";
import axiosInstance from "../utils/axios";
import "./CalendarStyle.css";

export default function EditPopup({ item = {}, date, onClose }) {
  const [form, setForm] = useState({
    schedule_id: item.schedule_id || null,
    m_name: item.m_name || "",
    start_date: item.start_date || date,
    end_date: item.end_date || date,
    cycle: item.cycle || "DAY_1",
    method: item.method || "oral",
  });

  const save = async () => {
    try {
      const method = form.schedule_id ? "put" : "post";

      await axiosInstance({
        url: "/api/schedule",
        method,
        data: form,
      });

      onClose();
    } catch (err) {
      console.error("약 정보 저장 실패:", err);
    }
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-card">
        <div className="popup-top">
          <button className="popup-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ fontWeight: 700 }}>약품 정보</div>

        <input
          placeholder="약품 이름"
          value={form.m_name}
          onChange={(e) => setForm({ ...form, m_name: e.target.value })}
        />

        <input
          type="date"
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        />

        <input
          type="date"
          value={form.end_date}
          onChange={(e) => setForm({ ...form, end_date: e.target.value })}
        />

        {/* 복용 주기 */}
        <div style={{ marginTop: 10, fontWeight: 600 }}>복용 주기</div>
        <div className="cycle-radio" style={{ marginBottom: 10 }}>
          <label>
            <input
              type="radio"
              name="cycle"
              value="DAY_1"
              checked={form.cycle === "DAY_1"}
              onChange={() => setForm({ ...form, cycle: "DAY_1" })}
            />
            하루 1회
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="cycle"
              value="DAY_2"
              checked={form.cycle === "DAY_2"}
              onChange={() => setForm({ ...form, cycle: "DAY_2" })}
            />
            하루 2회
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="cycle"
              value="DAY_3"
              checked={form.cycle === "DAY_3"}
              onChange={() => setForm({ ...form, cycle: "DAY_3" })}
            />
            하루 3회
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="cycle"
              value="DAY_4"
              checked={form.cycle === "DAY_4"}
              onChange={() => setForm({ ...form, cycle: "DAY_4" })}
            />
            하루 4회
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="cycle"
              value="WEEK_1"
              checked={form.cycle === "WEEK_1"}
              onChange={() => setForm({ ...form, cycle: "WEEK_1" })}
            />
            주 1회
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="cycle"
              value="WEEK_2"
              checked={form.cycle === "WEEK_2"}
              onChange={() => setForm({ ...form, cycle: "WEEK_2" })}
            />
            주 2회
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="cycle"
              value="WEEK_3"
              checked={form.cycle === "WEEK_3"}
              onChange={() => setForm({ ...form, cycle: "WEEK_3" })}
            />
            주 3회
          </label>
        </div>

        {/* 복용 방법 */}
        <div style={{ fontWeight: 600, marginTop: 10 }}>복용 방법</div>
        <select
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="oral">물과 복용</option>
          <option value="after_meal">식후 복용</option>
          <option value="before_meal">식전 복용</option>
          <option value="injection">주사</option>
          <option value="spray">흡입</option>
          <option value="etc">기타</option>
        </select>

        <button
          className="popup-add-btn"
          style={{ marginTop: 15 }}
          onClick={save}
        >
          저장
        </button>
      </div>
    </div>
  );
}
