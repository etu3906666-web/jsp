import React, { useRef } from "react";
import  {  useNavigate  }  from  "react-router-dom" ;
import "./LoginJoin.css";


export default function LoginJoin() {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };
  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="LoginJoinContainer">
      <img src="/image/pattern.png" className="Login-pattern-image" />
      <img src="/image/pattern1.png" className="Login-pattern1-image" />

      <div className="Login-content-wrapper">

        <p className="Login-welcome-text">로그인을 시작합니다.</p>
        <p className="Login-description-text">의료 AI 서비스 약찾고와 함께하세요.</p>

        <div className="Login-item">
          <img src="/image/medicalsafe_logo.png" className="Login-logo-image" />
        </div>

        <div className="button-group">
          <button className="login-btn" onClick={handleLogin}>로그인</button>
          <button className="signup-btn" onClick={handleSignup}>회원가입</button>
        </div>

      </div>
    </div>
  );
}
