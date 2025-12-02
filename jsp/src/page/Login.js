import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!username || !password) {
            alert("아이디와 비밀번호를 입력하세요.");
            return;
        }

        try {
            const res = await axiosInstance.post("/api/auth/login", {
                userID: username,
                password
            });

            const { token, member_id, userID } = res.data.data;

            // JWT 및 사용자 정보 저장
            localStorage.setItem("token", token);
            localStorage.setItem("member_id", member_id);
            localStorage.setItem("userID", userID);

            alert("로그인 성공!");
            navigate("/main");

        } catch (error) {
            console.error("로그인 에러 상세:", error);
            console.error("응답 데이터:", error.response?.data);
            alert(error.response?.data?.message || "로그인 중 오류 발생");
        }
    };

    return (
        <div className="LoginContainer">
            <img src="/image/pattern.png" className="Login-Primary-Patterntopimage" alt="" />
            <img src="/image/Primary_Pattern.png" className="Login-Primary-PatternBottonimage" alt="" />

            <div className="Login-content">
                <p className="Login-title">로그인</p>

                <label className="Login-label">아이디</label>
                <input
                    type="text"
                    className="Login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label className="Login-label">비밀번호</label>
                <input
                    type="password"
                    className="Login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="Login-button" onClick={handleLogin}>
                    로그인
                </button>
            </div>
        </div>
    );
}
