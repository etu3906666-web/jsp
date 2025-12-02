// /src/routes/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({ children }) {
    const user = getCurrentUser(); // JWT 검사

    if (!user) {
        alert("로그인이 필요합니다.");
        return <Navigate to="/login" replace />;
    }

    return children;
}
