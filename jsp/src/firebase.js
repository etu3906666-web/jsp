// Firebase 기본 SDK
import { initializeApp } from "firebase/app";

// Firebase 인증(Auth)
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Firestore (DB)
import { getFirestore } from "firebase/firestore";

// 네가 Firebase 콘솔에서 받은 설정값
const firebaseConfig = {
  apiKey: "AIzaSyCNzLrQEU9TC_fYw7gyuDFX6Us2n9Ixdo0",
  authDomain: "gptmedical.firebaseapp.com",
  projectId: "gptmedical",
  storageBucket: "gptmedical.firebasestorage.app",
  messagingSenderId: "653640372480",
  appId: "1:653640372480:web:399ebeaa80a719de49a3e5",
  measurementId: "G-K67LJ8JTSH"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth / Firestore 인스턴스 export
export const auth = getAuth(app);
export const db = getFirestore(app);

// reCAPTCHA 설정 (전화번호 인증 필수)
export const setRecaptcha = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,                      // 첫 번째 인자 (v9)
    "recaptcha-container",     // 두 번째 인자: DOM id
    {
      size: "invisible",
    }
  );
};

// 전화번호 인증 보내기 함수
export const sendSMSCode = async (phoneNumber) => {
  const formatted = "+82" + phoneNumber.slice(1); // 한국번호 국제포맷
  
  const confirmation = await signInWithPhoneNumber(
    auth,
    formatted,
    window.recaptchaVerifier
  );

  window.confirmationResult = confirmation; // 나중에 인증 확인에 사용
  return true;
};
