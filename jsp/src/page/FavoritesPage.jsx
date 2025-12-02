import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites] = useState([
    { id: 1, name: '타이레놀 500mg', category: '해열진통제' },
    { id: 2, name: '게보린', category: '해열진통제' },
    { id: 3, name: '비타민 C 1000mg', category: '영양제' },
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
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
};

export default FavoritesPage;

