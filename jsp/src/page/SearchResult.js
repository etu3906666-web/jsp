import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { askGPT } from "../api/gpt";
import "./SearchResult.css";

export default function SearchResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("query");

    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState("");

    const hasCalled = useRef(false);
    const [input, setInput] = useState("");

    const handleSearch = () => {
        if (!input.trim()) {
            alert("궁금하신 내용을 입력하세요!");
            return;
        }

        setAnswer("");
        setLoading(true);
        hasCalled.current = false;

        navigate(`/search?query=${encodeURIComponent(input)}`);
    };

    useEffect(() => {
        hasCalled.current = false;
    }, [query]);

    const iconMap = {
        "1": "💊",
        "2": "🌿",
        "3": "⭐",
        "4": "📌",
        "5": "⚠️",
        "6": "🚫",
        "7": "🔍",
        "8": "📝"
    };

    const formatGPTText = (text) => {
        return text
            .replace(/^1\)/gm, "1)")
            .replace(/^2\)/gm, "2)")
            .replace(/^3\)/gm, "3)")
            .replace(/^4\)/gm, "4)")
            .replace(/^5\)/gm, "5)")
            .replace(/^6\)/gm, "6)")
            .replace(/^7\)/gm, "7)")
            .replace(/^8\)/gm, "8)")
            .replace(/[⚠️⭐🌿💊📌🚫🔍📝✨🔥👉🌟]+/g, "")
            .replace(/- /g, "• ");
    };

    useEffect(() => {
        const fetchResult = async () => {
            if (!query) return;
            if (hasCalled.current) return;
            hasCalled.current = true;

            const res = await askGPT(query);
            const formatted = formatGPTText(res);
            setAnswer(formatted);
            setLoading(false);
        };

        fetchResult();
    }, [query]);

    // 🔥 모드 자동 분리
    const mode =
        answer.startsWith("[A]") ? "A" :
            answer.startsWith("[B]") ? "B" :
                answer.startsWith("[C]") ? "C" : "A";

    // 🔥 첫 줄([A][B][C]) 제거
    const cleanAnswer = answer.replace(/^\[[A-C]\]\s*/, "");

    // 🔥 A 모드 → 1~8 구조 분리
    const sections =
        cleanAnswer.split(/(?=\d\))/g).filter((s) => s.trim() !== "");

    return (
        <div className="ResultContainer">
            <img src="/image/mini_pattern.png" className="Login-Primary-Patterntopimage" />
            <img src="/image/Primary_Pattern.png" className="Login-Primary-PatternBottonimage" />
            {/* ✔ 로딩 화면 */}
            {loading ? (
                <div className="LoadingBox">
                    <img
                        src="/image/loadingpattern.png"
                        alt="loading"
                        className="LoadingImage"
                    />
                    <p className="LoadingText">의약품 정보를 분석 중입니다...</p>
                </div>
            ) : (
                <>
                    {/* 🔵 A 모드 — 상세 말풍선 카드 */}
                    {mode === "A" && (
                        <div className="A-ModeWrapper">
                            <div className="ResultBox">
                                {sections.map((sec, index) => {
                                    const titleMatch = sec.match(/^(\d\)\s*.*?)(?:\n|$)/);
                                    const title = titleMatch ? titleMatch[1] : "";
                                    const content = sec.replace(title, "").trim();
                                    const num = title.charAt(0);
                                    const icon = iconMap[num] || "💊";

                                    return (
                                        <div className="section-card" key={index}>
                                            <div className="icon-bubble">{icon}</div>

                                            <div className="bubble-box">
                                                <p className="bubble-title">{title}</p>
                                                <div className="bubble-content">
                                                    <ReactMarkdown>{content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 🟩 B 모드 — 간단 약 추천 */}
                    {mode === "B" && (
                        <div className="SimpleBox">
                            <ReactMarkdown>{cleanAnswer}</ReactMarkdown>
                        </div>
                    )}

                    {/* 🟨 C 모드 — 약 간단 요약 */}
                    {mode === "C" && (
                        <div className="SimpleBox">
                            <ReactMarkdown>{cleanAnswer}</ReactMarkdown>
                        </div>
                    )}
                </>
            )}

            {/* 🔍 SearchBox (하단 20% 고정) */}
            <div className="ResultSearchWrapper">
                <div className="Result-SearchBox">
                    <input
                        type="text"
                        className="SearchInput"
                        placeholder="궁금한 내용을 입력하세요"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className="VoiceButton">
                        <img src="/image/voice.png" alt="Voice" />
                    </button>
                </div>
            </div>
        </div>
    );
}
