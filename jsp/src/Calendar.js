import React, { useState } from "react";
import CalendarBase from "./CalendarBase";
import CalendarPopup from "./CalendarPopup";
import "./CalendarStyle.css";

export default function CalendarWithPopup() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleDateClick = (date) => {
    setSelectedDate(date);  // "YYYY-MM-DD"
    setPopupOpen(true);
  };

  return (
    <div className="main-wrapper">

      {/* CalendarBase가 월 표시도 하므로 필요 시 삭제 */}
      {/* <div className="month-title">
        {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
      </div> */}

      <CalendarBase onDateClick={handleDateClick} />

      <div className="event-buttons">
        <button className="event-btn">
          <span className="icon">💊</span> 고혈압 약 드셨나요?
        </button>
        <button className="event-btn">
          <span className="icon">🧬</span> 아침에 영양제 뭘 드셨나요?
        </button>
      </div>

      {popupOpen && (
        <CalendarPopup
          selectedDate={selectedDate}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </div>
  );
}
