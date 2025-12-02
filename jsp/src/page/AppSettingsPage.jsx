// AppSettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import "./AppSettingsPage.css";

export default function AppSettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserInfo = async () => {
    try {
      const res = await axiosInstance.get("/api/user/me");

      console.log("user/me 응답:", res.data); // 구조 확인용

      // ★ success() 래퍼를 쓰므로 실제 데이터는 res.data.data 안에 있다
      const payload = res.data.data;

      setUser(payload);
      setLoading(false);
    } catch (err) {
      console.error("UserInfo 로드 오류:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  if (loading) return <div className="loading">불러오는 중...</div>;
  if (!user) return <div className="loading">사용자 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="app-settings-wrapper">
      <div className="app-settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">앱 설정</div>
      </div>

      <div className="user-info-card">
        <div className="info-row">
          <span className="info-label">아이디</span>
          <span className="info-value">{user.userID}</span>
        </div>

        <div className="info-row">
          <span className="info-label">이메일</span>
          <span className="info-value">{user.email || "-"}</span>
        </div>

        <div className="info-row">
          <span className="info-label">전화번호</span>
          <span className="info-value">{user.phone_num || "-"}</span>
        </div>

        <div className="info-row">
          <span className="info-label">가족 코드</span>
          <span className="info-value">{user.family_code}</span>
        </div>

        <div className="info-row">
          <span className="info-label">역할</span>
          <span className="info-value">
            {user.role === 1 ? "보호자" : "일반 사용자"}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">SNS 로그인</span>
          <span className="info-value">{user.SNS ? "사용함" : "미사용"}</span>
        </div>

        <div className="info-row">
          <span className="info-label">가입일</span>
          <span className="info-value">{user.join_date}</span>
        </div>

        <div className="info-row">
          <span className="info-label">마지막 로그인</span>
          <span className="info-value">{user.last_login}</span>
        </div>
      </div>

      <div className="family-link-btn-wrapper">
        <button
          className="family-link-btn"
          onClick={() => navigate("/family-Manage")}
        >
          가족 연동하기
        </button>
      </div>
    </div>
  );
}
