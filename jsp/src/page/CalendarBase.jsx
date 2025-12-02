import React, { useState } from "react";

export default function CalendarBase({ onDateClick }) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth(); // 0~11

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekday = firstDay.getDay(); // 0~6

  const calendarCells = [];

  // 1일 이전 빈 칸
  for (let i = 0; i < firstWeekday; i++) calendarCells.push(null);

  // 이번 달 날짜
  for (let d = 1; d <= lastDay.getDate(); d++) {
    calendarCells.push(new Date(year, month, d));
  }

  // format "YYYY-MM-DD"
  const format = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // 오늘 표시
  const today = new Date();
  const isToday = (d) =>
    d &&
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button onClick={prevMonth} className="arrow-btn">＜</button>
        <span className="calendar-header-title">
          {year}년 {month + 1}월
        </span>
        <button onClick={nextMonth} className="arrow-btn">＞</button>
      </div>

      <div className="weekday-row">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="weekday">{d}</div>
        ))}
      </div>

      <div className="date-grid">
        {calendarCells.map((cell, idx) =>
          cell === null ? (
            <div key={idx} className="date-empty"></div>
          ) : (
            <div
              key={idx}
              className={`date-circle ${isToday(cell) ? "today" : ""}`}
              onClick={() => onDateClick(format(cell))}
            >
              {cell.getDate()}
            </div>
          )
        )}
      </div>
    </div>
  );
}
