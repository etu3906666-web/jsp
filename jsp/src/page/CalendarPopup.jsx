// CalendarPopup.jsx

import React, { useState } from "react";
import { addSchedule } from "../api/schedule";   // 기존 API 그대로 사용

export default function CalendarPopup({ selectedDate, onClose }) {

  const member_id = localStorage.getItem("member_id");
  const [m_name, setMName] = useState("");
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);

  // 추가된 입력 항목
  const [cycle, setCycle] = useState("DAY_1");
  const [method, setMethod] = useState("oral");

  const handleSubmit = async () => {
    await addSchedule({
      member_id,
      m_name,
      start_date: startDate,
      end_date: endDate,
      cycle,
      method,
    });

    alert("스케줄이 추가되었습니다.");
    onClose();
  };

  return (
    <div className="calendar-popup">
      <h3>스케줄 추가</h3>

      <label>약품명</label>
      <input
        type="text"
        value={m_name}
        onChange={(e) => setMName(e.target.value)}
      />

      <label>시작 날짜</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label>종료 날짜</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <h4>복용 주기</h4>
      <div className="cycle-radio">
        <label><input type="radio" name="cycle" value="DAY_1" onChange={() => setCycle("DAY_1")} /> 하루 1회</label><br />
        <label><input type="radio" name="cycle" value="DAY_2" onChange={() => setCycle("DAY_2")} /> 하루 2회</label><br />
        <label><input type="radio" name="cycle" value="DAY_3" onChange={() => setCycle("DAY_3")} /> 하루 3회</label><br />
        <label><input type="radio" name="cycle" value="DAY_4" onChange={() => setCycle("DAY_4")} /> 하루 4회</label><br />
        <label><input type="radio" name="cycle" value="WEEK_1" onChange={() => setCycle("WEEK_1")} /> 일주일 1회</label><br />
        <label><input type="radio" name="cycle" value="WEEK_2" onChange={() => setCycle("WEEK_2")} /> 일주일 2회</label><br />
        <label><input type="radio" name="cycle" value="WEEK_3" onChange={() => setCycle("WEEK_3")} /> 일주일 3회</label><br />
      </div>

      <h4>복용 방법</h4>
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="oral">물과 복용</option>
        <option value="after_meal">식후 복용</option>
        <option value="before_meal">식전 복용</option>
        <option value="injection">주사</option>
        <option value="spray">흡입</option>
        <option value="etc">기타</option>
      </select>

      <div className="button-area">
        <button onClick={handleSubmit}>추가</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
