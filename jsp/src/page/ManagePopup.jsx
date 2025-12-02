import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";     // ★ axios 추가
import EditPopup from "./EditPopup";
import "./CalendarStyle.css";

export default function ManagePopup({ onClose, date }) {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axiosInstance.get(`/api/schedule/manage?date=${date}`);
      setList(res.data);
    } catch (err) {
      console.error("스케줄 로드 실패:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await axiosInstance.delete(`/api/schedule/${id}`);
      load();
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-card">
        <div className="popup-top">
          <button className="popup-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ fontWeight: 700, marginBottom: 10 }}>복용 스케줄</div>

        {(list.data || []).map(item => (
          <div key={item.schedule_id} className="RecordItem">
            {item.m_name}  
            시작: {item.start_date}  
            종료: {item.end_date}  
            주기: {item.cycle}
            <button
              style={{ marginLeft: "auto", color: "red" }}
              onClick={() => removeItem(item.schedule_id)}
            >
              X
            </button>
          </div>
        ))}

        <button
          className="popup-add-btn"
          style={{ marginTop: 20 }}
          onClick={() => setEditItem({})}
        >
          약품 추가
        </button>

        {editItem && (
          <EditPopup
            item={editItem}
            date={date}
            onClose={() => {
              setEditItem(null);
              load();   // 저장 후 리스트 갱신
            }}
          />
        )}
      </div>
    </div>
  );
}
