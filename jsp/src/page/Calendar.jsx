// src/page/Calendar.jsx
import React, { useState } from "react";
import CalendarBase from "./CalendarBase";
import ManagePopup from "./ManagePopup";
import axiosInstance from "../utils/axios";

import "./CalendarStyle.css";
import "./Calendar.css";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [medicineList, setMedicineList] = useState([]);

  const [manageOpen, setManageOpen] = useState(false);

  const [protectedMode, setProtectedMode] = useState(null);
  const [familyListOpen, setFamilyListOpen] = useState(false);
  const [familyChildren, setFamilyChildren] = useState([]);

  const [confirmData, setConfirmData] = useState(null);

  /** 스케줄 조회 GET */
  const getSchedule = async (date, target = null) => {
    try {
      const res = await axiosInstance.get("/api/schedule", {
        params: { date, target },
      });
      return res.data?.data || [];
    } catch (err) {
      console.error("스케줄 조회 오류:", err);
      return [];
    }
  };

  /** 서버에서 받은 raw 리스트를 화면용으로 변환 */
  const buildMedicineList = (list) =>
    list.map((item) => {
      // record_id가 있으면 무조건 복용된 것으로 취급
      const isTaken =
        !!item.record_id || item.taken === 1 || item.taken === true;

      return {
        ...item,
        taken: isTaken,
        record_id: item.record_id ?? null,
        uniqueKey: item.record_id
          ? `rec_${item.record_id}`
          : `s_${item.schedule_id}_${item.planned_time}`,
      };
    });

  /** 날짜 클릭 */
  const handleDateClick = async (date) => {
    setSelectedDate(date);

    const list = await getSchedule(date, protectedMode);
    setMedicineList(buildMedicineList(list));
  };

  /** 리스트 클릭 */
  const handleItemClick = (item) => {
    if (protectedMode) return;
    setConfirmData(item);
  };

  /** 복용/취소 처리 (UI를 로컬 상태 기준으로 즉시 토글) */
  const confirmTake = async (yes) => {
    if (!confirmData) return;

    let newList = [...medicineList];

    if (yes) {
      // 1) 복용 기록 추가
      if (!confirmData.taken) {
        try {
          const res = await axiosInstance.post("/api/record/take", {
            schedule_id: confirmData.schedule_id,
            planned_time: confirmData.planned_time,
            date: selectedDate,
          });

          const newRecordId = res.data.record_id;

          // 로컬 상태에서 해당 항목만 taken=true, record_id 업데이트
          newList = newList.map((item) =>
            item.uniqueKey === confirmData.uniqueKey
              ? {
                  ...item,
                  taken: true,
                  record_id: newRecordId,
                  uniqueKey: `rec_${newRecordId}`,
                }
              : item
          );
        } catch (err) {
          console.error("복용 기록 저장 실패:", err);
        }
      }

      // 2) 복용 취소
      else {
        try {
          if (confirmData.record_id) {
            await axiosInstance.post("/api/record/cancel", {
              record_id: confirmData.record_id,
            });
          }

          // 로컬 상태에서 해당 항목만 taken=false, record_id 제거
          newList = newList.map((item) =>
            item.uniqueKey === confirmData.uniqueKey ||
            (confirmData.record_id &&
              item.record_id === confirmData.record_id)
              ? {
                  ...item,
                  taken: false,
                  record_id: null,
                  uniqueKey: `s_${item.schedule_id}_${item.planned_time}`,
                }
              : item
          );
        } catch (err) {
          console.error("복용 취소 실패:", err);
        }
      }
    }

    setConfirmData(null);
    setMedicineList(newList);
  };

  /** 가족 스케줄 모달 */
  const openFamilyModal = async () => {
    try {
      const res = await axiosInstance.get("/api/family/info");

      if (res.data.data.role === 1) {
        setFamilyChildren(res.data.data.children);
        setFamilyListOpen(true);
      } else {
        alert("보호자만 가족 스케줄을 조회할 수 있습니다.");
      }
    } catch (err) {
      console.error("가족 정보 조회 실패:", err);
    }
  };

  /** 피보호자 선택 */
  const selectProtected = async (id) => {
    setProtectedMode(id);
    setFamilyListOpen(false);

    if (selectedDate) {
      const list = await getSchedule(selectedDate, id);
      setMedicineList(buildMedicineList(list));
    }
  };

  /** 내 스케줄로 복귀 */
  const backToMySchedule = async () => {
    setProtectedMode(null);

    if (selectedDate) {
      const list = await getSchedule(selectedDate, null);
      setMedicineList(buildMedicineList(list));
    }
  };

  return (
    <div className="main-wrapper">
      <div className="month-title">
        {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
      </div>

      <CalendarBase onDateClick={handleDateClick} />

      <button
        className="RecordItem"
        style={{ background: "#cde", marginTop: "15px" }}
        onClick={openFamilyModal}
      >
        가족 스케쥴 확인
      </button>

      {selectedDate && (
        <div className="RecordBox">
          {medicineList.map((item) => (
            <button
              key={item.uniqueKey}
              className={`RecordItem ${item.taken ? "checked" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <img src="/pill.png" alt="" />
              {item.planned_time} - {item.m_name}
              {item.taken ? <span className="CheckMark">O</span> : null}
            </button>
          ))}

          {!protectedMode && (
            <button
              className="RecordItem"
              style={{ background: "#eee", marginTop: "10px" }}
              onClick={() => setManageOpen(true)}
            >
              복용 관리
            </button>
          )}
        </div>
      )}

      {confirmData && (
        <div className="popup-backdrop">
          <div className="popup-card">
            <div className="popup-top">
              <button
                className="popup-close"
                onClick={() => setConfirmData(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {!confirmData.taken
                ? "약을 복용하였습니까?"
                : "복용을 취소하시겠습니까?"}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="popup-add-btn"
                onClick={() => confirmTake(true)}
              >
                예
              </button>
              <button
                className="popup-add-btn add2"
                onClick={() => confirmTake(false)}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}

      {manageOpen && !protectedMode && (
        <ManagePopup
          onClose={() => setManageOpen(false)}
          date={selectedDate}
        />
      )}

      {familyListOpen && (
        <div className="popup-backdrop">
          <div className="popup-card">
            <div className="popup-top">
              <button
                className="popup-close"
                onClick={() => setFamilyListOpen(false)}
              >
                ✕
              </button>
            </div>

            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
              피보호자 선택
            </h3>

            {familyChildren.length === 0 ? (
              <div style={{ textAlign: "center", color: "#777" }}>
                피보호자가 없습니다.
              </div>
            ) : (
              familyChildren.map((child) => (
                <button
                  key={child.member_id}
                  className="RecordItem"
                  onClick={() => selectProtected(child.member_id)}
                >
                  {child.userID} 님의 스케쥴 확인
                </button>
              ))
            )}

            <button
              className="RecordItem"
              style={{ marginTop: 10, background: "#ddd" }}
              onClick={backToMySchedule}
            >
              내 스케쥴로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
