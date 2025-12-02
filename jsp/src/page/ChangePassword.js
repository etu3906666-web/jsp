import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import './Login.css';
import './MyPage.css';
import './ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [passwordInput, setPasswordInput] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleBack = () => {
    navigate(-1);
  };

  const handlePasswordChange = async () => {
    if (!passwordInput.current || !passwordInput.new || !passwordInput.confirm) {
      setPasswordMessage('모든 필드를 입력해주세요.');
      setMessageType('error');
      return;
    }
    if (passwordInput.new !== passwordInput.confirm) {
      setPasswordMessage('새 비밀번호가 일치하지 않습니다.');
      setMessageType('error');
      return;
    }
    if (passwordInput.new.length < 6) {
      setPasswordMessage('새 비밀번호는 6자 이상이어야 합니다.');
      setMessageType('error');
      return;
    }

    try {
      const userID = localStorage.getItem('userID');
      
      if (!userID) {
        setPasswordMessage('사용자 정보를 찾을 수 없습니다.');
        setMessageType('error');
        return;
      }

      const res = await axiosInstance.post('/api/auth/change-password', {
        userID: userID,
        currentPassword: passwordInput.current,
        newPassword: passwordInput.new
      });

      if (res.data.status === 'success') {
        setPasswordMessage('비밀번호가 변경되었습니다.');
        setMessageType('success');

        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setPasswordMessage(res.data.message || '비밀번호 변경에 실패했습니다.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      const errorMessage = error.response?.data?.message || '비밀번호 변경에 실패했습니다.';
      setPasswordMessage(errorMessage);
      setMessageType('error');
    }
  };

  return (
    <div>
      <img src="/image/Primary_Pattern.png" className="Login-Primary-PatternBottonimage" />
      <div className="LoginContainer">
        <div className="MyPage-container">
          <div className="mypage-header">
            <button className="back-button" onClick={handleBack}>
              &lt;
            </button>
            <h1 className="mypage-title">비밀번호 변경</h1>
          </div>
          <div className="change-password-container">
            <div className="change-password-field">
              <label className="change-password-label">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={passwordInput.current}
                onChange={(e) => setPasswordInput({ ...passwordInput, current: e.target.value })}
                placeholder="현재 비밀번호"
                className="change-password-input"
              />
            </div>
            <div className="change-password-field">
              <label className="change-password-label">
                새 비밀번호
              </label>
              <input
                type="password"
                value={passwordInput.new}
                onChange={(e) => setPasswordInput({ ...passwordInput, new: e.target.value })}
                placeholder="새 비밀번호"
                className="change-password-input"
              />
            </div>
            <div className="change-password-field">
              <label className="change-password-label">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordInput.confirm}
                onChange={(e) => setPasswordInput({ ...passwordInput, confirm: e.target.value })}
                placeholder="비밀번호 확인"
                className="change-password-input"
              />
            </div>
            {passwordMessage && (
              <div className={`change-password-message ${messageType}`}>
                {passwordMessage}
              </div>
            )}
            <div className="change-password-button-group">
              <button
                onClick={handleBack}
                className="change-password-button cancel"
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                className="change-password-button submit"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
