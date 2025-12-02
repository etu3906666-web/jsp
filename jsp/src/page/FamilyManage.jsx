import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useNavigate } from "react-router-dom";
import "./FamilyManage.css";

export default function FamilyManage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState(null);

  // 가족 정보 불러오기
  const loadFamilyInfo = async () => {
    try {
      const res = await axiosInstance.get("/api/family/info");

      // success() 래핑 고려 → res.data.data
      setFamily(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("가족 정보 조회 실패:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyInfo();
  }, []);

  // ----------------------------------------
  // 로딩 중
  // ----------------------------------------
  if (loading) return <div className="loading">불러오는 중...</div>;

  // ----------------------------------------
  // family === null → 초기 유저 (가족 없음)
  // ----------------------------------------
  if (family === null) {
    return (
      <div className="family-wrapper">
        <h2>가족이 없습니다</h2>

        <button
          className="family-btn"
          onClick={() =>
            axiosInstance.post("/api/family/create").then(loadFamilyInfo)
          }
        >
          가족 그룹 만들기
        </button>

        <button
          className="family-btn"
          onClick={() => navigate("/family-connect")}
        >
          가족 찾기 (연동하기)
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // family.hasFamily === false → 가족 코드 없음
  // ----------------------------------------
  if (family && family.hasFamily === false) {
    return (
      <div className="family-wrapper">
        <h2>가족이 없습니다</h2>

        <button
          className="family-btn"
          onClick={() =>
            axiosInstance.post("/api/family/create").then(loadFamilyInfo)
          }
        >
          가족 그룹 만들기
        </button>

        <button
          className="family-btn"
          onClick={() => navigate("/family-connect")}
        >
          가족 찾기 (연동하기)
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // family.hasFamily === true
  // 보호자 여부 체크
  // ----------------------------------------

  // ② 피보호자 (role = 0)
  if (family.role === 0) {
    return (
      <div className="family-wrapper">
        <h2>보호자 정보</h2>

        <div className="family-card">
          <div className="label">보호자</div>
          <div>{family.protector.userID}</div>
        </div>
      </div>
    );
  }

  // ③ 보호자 (role = 1)
  return (
    <div className="family-wrapper">
      <h2>가족 구성원</h2>

      {/* 보호자 자기 자신 */}
      <div className="family-card">
        <div className="label">보호자(본인)</div>
        <div>{family.protector.userID}</div>
      </div>

      <h3 style={{ marginTop: "20px" }}>피보호자 목록</h3>

      {(!family.children || family.children.length === 0) && (
        <div className="empty">등록된 피보호자가 없습니다.</div>
      )}

      {family.children?.map((child) => (
        <div className="family-card" key={child.member_id}>
          <div className="label">피보호자</div>
          <div>{child.userID}</div>
        </div>
      ))}

      <button
        className="family-btn"
        onClick={() => navigate("/family-connect")}
      >
        가족 구성원 추가
      </button>
    </div>
  );
}
