import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/DashboardNavbar.css";

const DashboardNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userDetails = useSelector((state) => state.user.userDetails);
  const { xrpBalance } = useSelector((state) => state.wallet);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="brand" onClick={handleLogoClick} role="button" tabIndex={0}>
          <img src="/logo.png" alt="Courtify Logo" className="logo" />
          <span className="title">Courtify</span>
        </div>

        <div className="balance-info">
          <span className="user-name">👤 {userDetails.Name ||"User"}</span>
          <span className="xrp-balance">||💰 {(xrpBalance / 1000000).toFixed(6)} XRP</span>
        </div>

        <div className="nav-links">
          <Link to="/dashboard/court">Add Court</Link>
          <Link to="/dashboard/myCourts">Manage Court</Link>
          <Link to="/dashboard/profile">Profile</Link>
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="profile">
          <img
            src={userDetails.imageUrl || "/default-user.png"}
            alt="User"
            className="profile-img"
          />
          <div className="profile-name">{userDetails.Name || "User"}</div>
        </div>
       <ul>
  <li>
    <Link to="/dashboard/wallet" onClick={() => setSidebarOpen(false)}>
      Wallet Management
    </Link>
  </li>
  <li>
    <Link to="/dashboard/profile/edit" onClick={() => setSidebarOpen(false)}>
      Edit Profile
    </Link>
  </li>
</ul>

      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardNavbar;
