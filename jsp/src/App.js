import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Flashback from "./page/Flashback";
import LoginJoin from "./page/LoginJoin";
import Login from "./page/Login";
import Signup from "./page/Signup";
import SearchResult from "./page/SearchResult";
import Calendar from "./page/Calendar";
import SettingsPage from "./page/SettingsPage";
import AppSettingsPage from "./page/AppSettingsPage";
import FamilyConnect from "./page/FamilyConnect";
import FamilyManage from "./page/FamilyManage";
import MyPage from "./page/MyPage";
import ChangePassword from "./page/ChangePassword";

import ProtectedRoute from "./components/ProtectedRoute";
import Main from "./page/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Flashback />} />
        <Route path="/loginjoin" element={<LoginJoin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchResult />} />
        <Route path="/family-connect" element={<FamilyConnect />} />
        <Route path="/family-Manage" element={<FamilyManage />} />

        {/* 일정 관리 페이지 */}
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/app-settings" element={<AppSettingsPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* 로그인 보호 페이지 */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
