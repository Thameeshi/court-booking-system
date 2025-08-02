import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as authLogout } from "../store/slices/authSlice";
import { clearUserDetails } from "../store/slices/userSlice";
import "../styles/AdminNavbar.css";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { web3auth } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      if (web3auth) {
        await web3auth.logout();
      }
      dispatch(authLogout());
      dispatch(clearUserDetails());
      localStorage.removeItem("userDetails");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav>
      <ul className="admin-navbar">
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/courts">Manage Courts</Link></li>
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
