import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('mypage');
  const [favorites] = useState([
    { id: 1, name: '타이레놀 500mg', category: '해열진통제' },
    { id: 2, name: '게보린', category: '해열진통제' },
    { id: 3, name: '비타민 C 1000mg', category: '영양제' },
  ]);
  const [recentSearches] = useState([
    { id: 1, term: '타이레놀', time: '5분 전' },
    { id: 2, term: '감기약', time: '1시간 전' },
    { id: 3, term: '소화제', time: '2시간 전' },
  ]);
  const [medicines] = useState([
    { id: 1, name: '오메가3', dosage: '1일 1회', time: '아침 식후' },
    { id: 2, name: '비타민 D', dosage: '1일 1회', time: '아침 식후' },
  ]);
  const [family] = useState([
    { id: 1, name: '김영희', relation: '배우자', medicines: 3 },
    { id: 2, name: '홍철수', relation: '자녀', medicines: 2 },
  ]);
  const [notifications, setNotifications] = useState({
    medicineReminder: true,
    familyAlert: true,
  });
  const menuItems = [
    { id: 1, label: '즐겨찾기', page: 'favorites' },
    { id: 2, label: '최근 검색', page: 'recent' },
    { id: 3, label: '가족 연동', page: 'family' },
    { id: 4, label: '복용중인 약', page: 'medicines' },
    { id: 5, label: '알림 설정', page: 'notifications' },
    { id: 6, label: '계정 설정', page: 'account' }
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

  // 즐겨찾기 페이지
  const FavoritesPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">즐겨찾기</h1>
        </div>
        <div className="menu-list">
          {favorites.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              즐겨찾은 의약품이 없습니다.
            </div>
          ) : (
            favorites.map((item) => (
              <div key={item.id} className="menu-item">
                <div>
                  <div className="menu-text">{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {item.category}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // 최근 검색 페이지
  const RecentPage = () => (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="mypage-title">최근 검색</h1>
        </div>
        <div className="menu-list">
          {recentSearches.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              검색 이력이 없습니다.
            </div>
          ) : (
            recentSearches.map((item) => (
              <div key={item.id} className="menu-item">
                <div>
                  <div className="menu-text">{item.term}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))
          )}
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
                    {item.dosage} · {item.time}
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
      case 'recent':
        return <RecentPage />;
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