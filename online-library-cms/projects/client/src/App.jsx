import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateAdminWrapper from "./wrapper/PrivateAdminWrapper";
import PrivateUserWrapper from "./wrapper/PrivateUserWrapper";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManageBookPage from "./pages/admin/AdminManageBookPage";
import AdminCreateBookPage from "./pages/admin/AdminCreateBookPage";
import AdminModifyBookPage from "./pages/admin/AdminModifyBookPage";
import AdminHistoryPage from "./pages/admin/AdminHistoryPage";
import UserHomePage from "./pages/user/UserHomePage";
import UserBookSinglePage from "./pages/user/UserBookSinglePage";
import UserProfilePage from "./pages/user/UserProfilePage";
import UserOngoingPage from "./pages/user/UserOngoingPage";
import UserHistoryPage from "./pages/user/UserHistoryPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route element={<PublicWrapper />}> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        {/* </Route> */}

        <Route element={<PrivateAdminWrapper />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/book" element={<AdminManageBookPage />} />
          <Route path="/admin/book/create" element={<AdminCreateBookPage />} />
          <Route path="/admin/book/:id" element={<AdminModifyBookPage />} />
          <Route path="/admin/history" element={<AdminHistoryPage />} />
        </Route>

        <Route element={<PrivateUserWrapper />}>
          <Route path="/" element={<UserHomePage />} />
          <Route path="/single-book/:id" element={<UserBookSinglePage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/user/ongoing-book" element={<UserOngoingPage />} />
          <Route path="/user/borrow-history" element={<UserHistoryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
