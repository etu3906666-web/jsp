
import React from "react";
import "./AddFamilyPopup.css";

export default function AddFamilyPopup({ user, onClose }) {
  return (
    <div className="family-popup-backdrop">
      <div className="family-popup-card">
        <div className="family-popup-top">
          <button className="popup-close" onClick={onClose}>✕</button>
        </div>

        <div className="popup-title">
          {user.userID} 님을 보호자로 추가하시겠습니까?
        </div>

        <div className="popup-buttons">
          <button className="popup-yes">예</button>
          <button className="popup-no" onClick={onClose}>아니오</button>
        </div>
      </div>
    </div>
  );
}
