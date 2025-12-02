// SettingsPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false); // ★ 로그아웃 팝업 상태

  const handleLogout = () => {
    // 토큰 제거
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // 첫 화면으로 이동
    navigate("/", { replace: true });
  };

  const menuItems = [
    {
      id: 1,
      label: "앱설정",
      onClick: () => navigate("/app-settings"),
    },
    { id: 2, label: "연락 문의", onClick: () => {} },
    { id: 3, label: "개인정보처리", onClick: () => {} },
    { id: 4, label: "앱정보", onClick: () => {} },

    // ★ 로그아웃 버튼
    { id: 5, label: "로그아웃", onClick: () => setLogoutOpen(true) },
  ];

  return (
    <div className="settings-wrapper">
      {/* 헤더 */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="settings-title">마이페이지</div>
      </div>

      {/* 메뉴 목록 */}
      <div className="settings-list">
        {menuItems.map((item) => (
          <div
            className="settings-item"
            key={item.id}
            onClick={item.onClick}
          >
            <span>{item.label}</span>
            <span className="arrow">›</span>
          </div>
        ))}
      </div>

      <div className="settings-bottom-illustration"></div>

      {/* ★ 로그아웃 팝업 */}
      {logoutOpen && (
        <div className="popup-backdrop">
          <div className="popup-card">
            <div className="popup-top">
              {/* 팝업 닫기 버튼 */}
              <button
                className="popup-close"
                onClick={() => setLogoutOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: "center", padding: "20px 0" }}>
              로그아웃 하시겠습니까?
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="popup-add-btn"
                onClick={handleLogout}  // ★ 로그아웃 실행
              >
                예
              </button>

              <button
                className="popup-add-btn add2"
                onClick={() => setLogoutOpen(false)} // 취소
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
