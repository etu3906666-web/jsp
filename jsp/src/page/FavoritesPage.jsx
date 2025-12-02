import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFavorites, removeFavorite } from '../utils/favorites';
import './MyPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 즐겨찾기 불러오기
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const memberId = localStorage.getItem('member_id');
      
      if (!memberId) {
        console.error('사용자 정보 없음');
        setFavorites([]);
        return;
      }

      // 서버에서 즐겨찾기 데이터 가져오기
      const favList = await getAllFavorites(memberId);
      console.log('즐겨찾기 목록:', favList);
      
      // UI용으로 변환: id, category, sections 포함
      const formattedList = favList.map((item, index) => ({
        id: index,
        name: item.name,
        category: item.sections.length > 0 ? item.sections[0].title : '정보 없음',
        sections: item.sections
      }));
      
      setFavorites(formattedList);
    } catch (error) {
      console.error('즐겨찾기 조회 실패:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // 즐겨찾기 삭제
  const handleRemoveFavorite = async (medicineName) => {
    try {
      const memberId = localStorage.getItem('member_id');
      if (!memberId) return;

      const confirmed = window.confirm(`${medicineName}을(를) 즐겨찾기에서 제거하시겠습니까?`);
      if (!confirmed) return;

      // 해당 의약품의 모든 섹션 제거
      const favoriteItem = favorites.find(f => f.name === medicineName);
      if (favoriteItem && favoriteItem.sections) {
        for (const section of favoriteItem.sections) {
          await removeFavorite(memberId, medicineName, section.number);
        }
      }

      // UI 업데이트
      setFavorites(favorites.filter(f => f.name !== medicineName));
      alert('즐겨찾기가 제거되었습니다.');
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
      alert('즐겨찾기 제거에 실패했습니다.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="mypage-wrapper">
      <img src="/image/Primary_Pattern.png" className="MyPage-Primary-PatternBottomimage" alt="" />
      <div className="MyPage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={handleBack}>&lt;</button>
          <h1 className="mypage-title">즐겨찾기</h1>
        </div>

        <div className="menu-list">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              로딩 중...
            </div>
          ) : favorites.length === 0 ? (
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
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f44336',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  onClick={() => handleRemoveFavorite(item.name)}
                  title="즐겨찾기 제거"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
