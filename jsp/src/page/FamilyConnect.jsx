import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useNavigate } from "react-router-dom";
import "./FamilyManage.css";   // 기존 스타일 재사용

export default function FamilyConnect() {
  const navigate = useNavigate();

  const [myFamily, setMyFamily] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [makeTargetProtector, setMakeTargetProtector] = useState(null);

  // 내 가족 상태 먼저 가져오기
  const loadMyFamily = async () => {
    try {
      const res = await axiosInstance.get("/api/family/info");
      setMyFamily(res.data.data || null);
    } catch (err) {
      console.error("내 가족 정보 조회 실패:", err);
    }
  };

  useEffect(() => {
    loadMyFamily();
  }, []);

  const handleSearch = async () => {
    setErrMsg("");
    setResult(null);

    if (!searchId.trim()) {
      setErrMsg("아이디를 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/user/search", {
        params: { userID: searchId.trim() }
      });

      const payload = res.data.data;
      if (!payload) {
        setErrMsg("해당 아이디의 사용자를 찾을 수 없습니다.");
      } else {
        setResult(payload);
      }
    } catch (err) {
      console.error("검색 실패:", err);
      setErrMsg("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 보호자 / 피보호자 / 무가족 상태에 따라 서버에 보낼 payload 구성
  const handleAdd = () => {
    setErrMsg("");

    if (!result) return;
    if (!myFamily || myFamily === null) {
      // 나는 가족 없음 → role 정보는 UserInfo에서 0일 것
      // 상대가 보호자면서 가족 있음이면: 바로 그 가족에 편입
      if (result.role === 1 && result.family_code !== null) {
        sendAddRequest(false); // makeTargetProtector는 의미 없음
        return;
      }

      // 상대도 가족 없음 & 피보호자 → 보호자 선택 팝업
      if (result.role === 0 && result.family_code === null) {
        setConfirmOpen(true);
        return;
      }

      setErrMsg("이 사용자는 가족으로 추가할 수 없습니다.");
      return;
    }

    // 나는 가족 있음
    if (myFamily.hasFamily && myFamily.role === 1) {
      // 나는 보호자 → 대상은 내 가족의 피보호자로 추가
      sendAddRequest(false);
      return;
    }

    if (myFamily.hasFamily && myFamily.role === 0) {
      setErrMsg("이미 가족에 소속된 피보호자는 구성원을 추가할 수 없습니다.");
      return;
    }

    setErrMsg("가족 상태를 확인할 수 없습니다.");
  };

  const sendAddRequest = async (makeTarget) => {
    try {
      setLoading(true);
      await axiosInstance.post("/api/family/add", {
        targetMemberId: result.member_id,
        makeTargetProtector: makeTarget
      });

      // 성공 시 가족 관리 화면으로 이동
      await loadMyFamily();
      navigate(-1); // 또는 navigate("/family-manage") 등
    } catch (err) {
      console.error("가족 추가 실패:", err);
      const msg =
        err.response?.data?.message || "가족 추가 중 오류가 발생했습니다.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setMakeTargetProtector(null);
    }
  };

  const handleConfirmYes = () => {
    // 예: 상대를 보호자로 설정
    setMakeTargetProtector(true);
    sendAddRequest(true);
  };

  const handleConfirmNo = () => {
    // 아니요: 나를 보호자로 설정
    setMakeTargetProtector(false);
    sendAddRequest(false);
  };

  return (
    <div className="family-wrapper">
      <h2>가족 연동</h2>

      <div className="family-card">
        <div className="label">상대 아이디</div>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="가족으로 추가할 아이디"
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ddd"
          }}
        />
      </div>

      <button
        className="family-btn"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "검색 중..." : "검색"}
      </button>

      {errMsg && <div className="empty" style={{ color: "red" }}>{errMsg}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>검색 결과</h3>
          <div className="family-card">
            <div>
              <div className="label">아이디</div>
              <div>{result.userID}</div>
            </div>
            <div>
              <div className="label">역할</div>
              <div>
                {result.role === 1 ? "보호자" : "피보호자(또는 미설정)"}
              </div>
            </div>
          </div>

          <button
            className="family-btn"
            onClick={handleAdd}
            disabled={loading}
          >
            가족으로 추가
          </button>
        </div>
      )}

      {/* 피보호자-피보호자 연결 시 보호자 선택 팝업 */}
      {confirmOpen && (
        <div className="popup-backdrop">
          <div className="popup-card">
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              이 사용자와 가족을 이루려면<br />
              보호자를 선택해야 합니다.
            </div>
            <div style={{ marginBottom: 12 }}>
              상대방을 보호자로 설정하시겠습니까?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="family-btn"
                style={{ marginTop: 0 }}
                onClick={handleConfirmYes}
              >
                예 (상대방 보호자)
              </button>
              <button
                className="family-btn"
                style={{ marginTop: 0 }}
                onClick={handleConfirmNo}
              >
                아니요 (내가 보호자)
              </button>
            </div>
            <button
              className="family-btn"
              style={{ marginTop: 10, background: "#aaa" }}
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
