import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [usernameChecked, setUsernameChecked] = useState(false);

  // 이름: 2~10 한글만
  const validateName = () => {
    const regex = /^[가-힣]{2,10}$/;
    if (!regex.test(name)) {
      alert("이름은 2~10자의 한글만 입력 가능합니다.");
      return false;
    }
    return true;
  };

  // 아이디: 영문+숫자 5~15자
  const validateUsername = () => {
    const regex = /^[a-zA-Z0-9]{5,15}$/;
    if (!regex.test(username)) {
      alert("아이디는 5~15자의 영문 또는 숫자만 가능합니다.");
      return false;
    }
    return true;
  };

  // 비밀번호: 영문+숫자+특수문자 8~20자
  const validatePassword = () => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/;
    if (!regex.test(password)) {
      alert("비밀번호는 영문+숫자+특수문자 포함 8~20자로 입력해야 합니다.");
      return false;
    }
    return true;
  };

  // 전화번호: 010으로 시작
  const validatePhone = () => {
    const regex = /^010\d{7,8}$/;
    if (!regex.test(phone)) {
      alert("전화번호는 010으로 시작하는 숫자만 입력 가능합니다.");
      return false;
    }
    return true;
  };

  // 아이디 중복 확인 (서버 API GET 요청)
  const checkUsernameDuplicate = async () => {
    if (!validateUsername()) return;

    try {
      const res = await axiosInstance.get(
        "/api/auth/check-username",
        { params: { userID: username } }
      );

      if (res.data.data.exists) {
        alert("이미 사용 중인 아이디입니다.");
        setUsernameChecked(false);
      } else {
        alert("사용 가능한 아이디입니다!");
        setUsernameChecked(true);
      }
    } catch (err) {
      console.error(err);
      alert("중복 확인 중 오류 발생");
    }
  };

  // 회원가입 요청 (서버 API POST 요청)
  const handleSignup = async () => {
    if (!validateName()) return;
    if (!validateUsername()) return;
    if (!validatePassword()) return;
    if (!validatePhone()) return;

    if (!usernameChecked) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/api/auth/register",
        {
          userID: username,
          password,
          email,
          phone_num: phone,
        }
      );

      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "회원가입 중 오류 발생");
    }
  };

  return (
    <>
      <div className="SignupContainer">
        <img
          src="/image/pattern.png"
          className="Signup-Primary-Pattern"
          alt=""
        />
        <img
          src="/image/Primary_Pattern.png"
          className="Signup-Primary-PatternBottonimage"
          alt=""
        />

        <div className="signup-content">
          <p className="Signup-title">회원가입</p>

          {/* 이름 */}
          <label className="Signup-label">이름</label>
          <input
            type="text"
            className="Signup-input"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* 아이디 + 중복확인 */}
          <label className="Signup-label">아이디</label>
          <div className="username-row">
            <input
              type="text"
              className="Signup-input"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameChecked(false); // 아이디 변경 시 다시 검사해야 함
              }}
            />
            <button className="check-btn" onClick={checkUsernameDuplicate}>
              중복확인
            </button>
          </div>

          {/* 비밀번호 */}
          <label className="Signup-label">비밀번호</label>
          <input
            type="password"
            className="Signup-input"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 이메일 */}
          <label className="Signup-label">이메일</label>
          <input
            type="email"
            className="Signup-input"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* 전화번호 */}
          <label className="Signup-label">전화번호</label>
          <input
            type="text"
            className="Signup-input"
            placeholder="01012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* 회원가입 버튼 */}
          <button className="Signup-button" onClick={handleSignup}>
            회원가입
          </button>
        </div>
      </div>
    </>
  );
}
