import React, { use } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

export default function Main() {
  const [input, setInput] = React.useState("");
  const [patternHeight, setPatternHeight] = React.useState(0);
  const [preview, setPreview] = React.useState(null);
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);


  const handleSearch = () => {
    if (!input.trim()) {
      alert("약 이름 또는 정보를 입력해주세요!");
      return;
    }

    //검색 페이지로 이동
    navigate(`/search?query=${encodeURIComponent(input)}`);
  };

  // 촬영 버튼 클릭 => 카메라 실행
  const openCamera = () => {
    console.log("📸 촬영 버튼 클릭됨");  // 👉 디버그용(눌리면 콘솔에 표시됨)
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.log("❌ fileInputRef가 null임");
    }
  };
  //촬영 후 파일 받아오기
  const handleCapture = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const imageURL = URL.createObjectURL(file);
    setPreview(imageURL);
  };

  const goSettings = () => {
    navigate("/settings");  // ← SettingsPage 라우트로 이동
  };

  return (
    <div className="MainContainer">
      {/* ⭐ 오른쪽 상단 설정 버튼 추가 */}
        <button className="SettingsButton" onClick={goSettings}>
          ⚙
        </button>

      {/* 기존 컨텐츠 */}
      <img src="/pattern-top.png" className="Main-PatternTop" alt="패턴" />
      
      {/* 패턴 이미지 + 높이 읽기 */}
      <img
        src="/image/pattern.png"
        className="Main-PatternTop"
        onLoad={(e) => setPatternHeight(e.target.offsetHeight)} // ⭐ 패턴 높이 측정
      />
      {/* <button className="more"><img src="/image/more.png" alt="More" /></button> */}
      <img src="/image/Primary_Pattern.png" className="Login-Primary-PatternBottonimage" />


      {/* 콘텐츠 위치 자동 조정 */}
      <div className="MainContent">
        <p className="MainTitle">어떤 알약에 정보가 필요하신가요?</p>

        <div className="SearchBox">
          <span className="SearchIcon"></span>
          <input
            type="text"
            className="SearchInput"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="VoiceButton"><img src="/image/voice.png" alt="Voice" /></button>
        </div>
        <div className="btn-container">
          <button className="CameraBtn" onClick={openCamera}>
            <img src="/image/camera.png" alt="Camera" />
            <span className="CameraText">촬영</span>
          </button>
          <button className="calendarBtn" onClick={() => navigate("/Calendar")}>
            <img src="/image/calendar.png" alt="Calendar" />
            <span className="CalendarText">일정 관리</span>
          </button>
          <button className="mypageBtn" onClick={() => navigate("/mypage")}>
            <img src="/image/mypage.png" alt="MyPage" />
            <span className="MypageText">마이페이지</span>
          </button>
        </div>

        {/* 숨겨진 input -> 카메라 실행 */}
         <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleCapture}
          style={{ display: "none" }}
        />

        {/* 촬영 미리보기 */}
        {preview && (
          <div className="PreviewBox">
            <img src={preview} alt="preview" className="PreviewImage" />
          </div>
        )}
      </div>
    </div>
  );
}
