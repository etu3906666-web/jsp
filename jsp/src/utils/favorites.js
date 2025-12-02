import axiosInstance from './axios';

/**
 * 즐겨찾기 추가
 * @param {string} memberId - 사용자 member_id
 * @param {string} medicineName - 의약품 이름
 * @param {object} sectionData - 섹션 데이터
 */
export const addFavorite = async (memberId, medicineName, sectionData) => {
  try {
    const { sectionNumber, sectionTitle, sectionIcon, content } = sectionData;
    
    const response = await axiosInstance.post('/api/favorites', {
      member_id: memberId,
      medicineName: medicineName,
      sectionNumber,
      sectionTitle,
      sectionIcon,
      content,
      timestamp: new Date().toISOString(),
    });
    
    console.log('즐겨찾기 추가 완료:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    return { success: false, error };
  }
};

/**
 * 즐겨찾기 삭제
 */
export const removeFavorite = async (memberId, medicineName, sectionNumber) => {
  try {
    const response = await axiosInstance.delete(`/api/favorites`, {
      data: {
        member_id: memberId,
        medicineName: medicineName,
        sectionNumber: sectionNumber
      }
    });
    
    console.log('즐겨찾기 삭제 완료:', response.data);
    return { success: true };
  } catch (error) {
    console.error('즐겨찾기 삭제 실패:', error);
    return { success: false, error };
  }
};

/**
 * 특정 섹션이 즐겨찾기 되어있는지 확인
 */
export const isFavorited = async (memberId, medicineName, sectionNumber) => {
  try {
    const response = await axiosInstance.get('/api/favorites/check', {
      params: {
        member_id: memberId,
        medicineName: medicineName,
        sectionNumber: sectionNumber
      }
    });
    return response.data?.isFavorited || false;
  } catch (error) {
    console.error('즐겨찾기 확인 실패:', error);
    return false;
  }
};

/**
 * 모든 즐겨찾기 가져오기 (의약품별로 그룹화)
 */
export const getAllFavorites = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/favorites', {
      params: {
        member_id: memberId
      }
    });
    
    console.log('즐겨찾기 목록:', response.data);
    
    const favorites = response.data?.data || [];
    
    // 의약품별로 그룹화
    const groupedByMedicine = {};
    favorites.forEach(fav => {
      if (!groupedByMedicine[fav.medicineName]) {
        groupedByMedicine[fav.medicineName] = {
          medicineName: fav.medicineName,
          createdAt: fav.createdAt || new Date().toISOString(),
          sections: []
        };
      }
      groupedByMedicine[fav.medicineName].sections.push({
        sectionNumber: fav.sectionNumber,
        sectionTitle: fav.sectionTitle,
        sectionIcon: fav.sectionIcon,
        content: fav.content
      });
    });
    
    // 배열로 변환 후 최신순 정렬
    const result = Object.values(groupedByMedicine);
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return result;
  } catch (error) {
    console.error('즐겨찾기 목록 가져오기 실패:', error);
    return [];
  }
};
