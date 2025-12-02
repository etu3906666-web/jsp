// /src/utils/auth.js
export function getToken() {
    return localStorage.getItem("token");
}

export function getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    // 필요 시 payload만 파싱해서 사용자 데이터 참조 가능
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload; // { member_id, userID, iat, exp }
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("member_id");
    localStorage.removeItem("userID");
}
