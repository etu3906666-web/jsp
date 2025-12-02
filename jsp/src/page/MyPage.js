import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import FavoritesPage from './FavoritesPage';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('mypage');
  const [medicines, setMedicines] = useState([]);
  const [family, setFamily] = useState([]);
  const [notifications, setNotifications] = useState({
    medicineReminder: true,
    familyAlert: true,
  });

  // 복용중인 약 데이터 가져오기
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        // 먼저 userID 확인
        const userID = localStorage.getItem('userID');
        const memberId = localStorage.getItem('member_id');
        console.log('저장된 사용자 정보 - userID:', userID, 'member_id:', memberId);

        // 전체 스케줄 조회
        const res = await axiosInstance.get('/api/schedule/manage');
        console.log('약 목록 조회 응답:', res.data);
        
        // cycle 코드를 한글로 변환하는 함수
        const convertCycle = (cycle) => {
          const cycleMap = {
            'DAY_1': '하루 1회',
            'DAY_2': '하루 2회',
            'DAY_3': '하루 3회',
            'DAY_4': '하루 4회',
            'WEEK_1': '주 1회',
            'WEEK_2': '주 2회',
            'WEEK_3': '주 3회'
          };
          return cycleMap[cycle] || cycle || '1회';
        };

        // 서버에서 받은 약 목록을 medicines 형식으로 변환
        const medicineList = (res.data?.data || res.data || []).map((item) => ({
          id: item.schedule_id || item.id,
          name: item.m_name || item.medicine_name || item.name || '약물명 없음',
          dosage: convertCycle(item.cycle)
        }));
        
        console.log('변환된 약 목록:', medicineList);
        setMedicines(medicineList);
      } catch (error) {
        console.error('약 목록 조회 실패:', error);
        console.error('에러 상세:', error.response?.data);
        setMedicines([]);
      }
    };

    // 복용중인 약 페이지로 이동했을 때만 조회
    if (currentPage === 'medicines') {
      fetchMedicines();
    }
  }, [currentPage]);

  // 가족 연동 데이터 가져오기
  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const res = await axiosInstance.get('/api/family/info');
        console.log('가족 정보 조회 응답:', res.data);
        
        // 서버 응답 형식에 따라 처리
        const familyInfo = res.data?.data;
        if (familyInfo) {
          // role이 1이면 보호자 (자녀 목록 표시)
          if (familyInfo.role === 1 && familyInfo.children) {
            const familyList = familyInfo.children.map((child) => ({
              id: child.member_id || child.id,
              name: child.name || child.userID,
              relation: '피보호자',
              medicines: child.medicines_count || 0
            }));
            setFamily(familyList);
          }
          // role이 0이면 피보호자 (보호자 표시)
          else if (familyInfo.role === 0 && familyInfo.protector) {
            const familyList = [{
              id: familyInfo.protector.member_id,
              name: familyInfo.protector.name || familyInfo.protector.userID,
              relation: '보호자',
              medicines: 0
            }];
            setFamily(familyList);
          }
        } else {
          setFamily([]);
        }
      } catch (error) {
        console.error('가족 정보 조회 실패:', error);
        setFamily([]);
      }
    };

    // 가족 연동 페이지로 이동했을 때만 조회
    if (currentPage === 'family') {
      fetchFamily();
    }
  }, [currentPage]);
  const menuItems = [
    { id: 1, label: '즐겨찾기', page: 'favorites' },
    { id: 2, label: '가족 연동', page: 'family' },
    { id: 3, label: '복용중인 약', page: 'medicines' },
    { id: 4, label: '알림 설정', page: 'notifications' },
    { id: 5, label: '계정 설정', page: 'account' }
  ];

  const handleBack = () => {
    if (currentPage === 'mypage') {
      navigate(-1);
    } else {
      setCurrentPage('mypage');
    }
  };

  const handleMenuClick = (item) => {
    setCurrentPage(item.page);
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('정말 로그아웃하시겠습니까?');
    if (confirmed) {
      try {
        // localStorage에서 토큰 및 사용자 정보 제거
        localStorage.removeItem('token');
        localStorage.removeItem('member_id');
        localStorage.removeItem('userID');
        
        alert('로그아웃되었습니다.');
        navigate('/login');
      } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다.');
      }
    }
  };

  const handlePasswordClick = () => {
    navigate('/change-password');
  };

  const MainPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">마이페이지</h1>
        </div>
        <div className="menu-list">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="menu-item"
              onClick={() => handleMenuClick(item)}
            >
              <span className="menu-text">{item.label}</span>
              <span className="menu-arrow">&gt;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 복용중인 약 페이지
  const MedicinesPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">복용중인 약</h1>
        </div>
        <div className="menu-list">
          {medicines.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              복용중인 약이 없습니다.
            </div>
          ) : (
            medicines.map((item) => (
              <div key={item.id} className="menu-item">
                <div>
                  <div className="menu-text">{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {item.dosage}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // 가족 연동 페이지
  const FamilyPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">가족 연동</h1>
        </div>
        <div className="menu-list">
          {family.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              연동된 가족이 없습니다.
            </div>
          ) : (
            family.map((member) => (
              <div key={member.id} className="menu-item">
                <div>
                  <div className="menu-text">{member.name}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {member.relation} · 약 {member.medicines}개
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/family-connect')}
        >
          가족 추가
        </button>
      </div>
    </div>
  );

  // 알림 설정 페이지
  const NotificationsPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">알림 설정</h1>
        </div>
        <div className="menu-list">
          <div className="menu-item">
            <span className="menu-text">복용 약 알림</span>
            <input
              type="checkbox"
              checked={notifications.medicineReminder}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  medicineReminder: e.target.checked,
                })
              }
            />
          </div>
          <div className="menu-item">
            <span className="menu-text">가족 알림</span>
            <input
              type="checkbox"
              checked={notifications.familyAlert}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  familyAlert: e.target.checked,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 계정 설정 페이지
  const AccountPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">계정 설정</h1>
        </div>
        <div className="menu-list">
          <div className="menu-item" onClick={handlePasswordClick}>
            <span className="menu-text">비밀번호 변경</span>
            <span className="menu-arrow">&gt;</span>
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <span className="menu-text">로그아웃</span>
            <span className="menu-arrow">&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 페이지 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case 'favorites':
        return <FavoritesPage />;
      case 'medicines':
        return <MedicinesPage />;
      case 'family':
        return <FamilyPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'account':
        return <AccountPage />;
      case 'mypage':
      default:
        return <MainPage />;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
};

export default MyPage;