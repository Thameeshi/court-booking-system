import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/UserNavbar.css"; // Import your CSS file for styling

const UserNavbar = () => {
  const userDetails = useSelector((state) => state.user.userDetails);
  const { xrpBalance } = useSelector((state) => state.wallet);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg vw-100">
        <div className="container-fluid">
        {/* Brand/Title with Logo */}
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
            <img src="/logo.png" alt="Logo" className="navbar-logo" />
            <span className="ms-2">Courtify</span>
          </Link>

          {/* User Details and Balance (hidden on small screens) */}
<div className="d-none d-lg-flex align-items-center ml-2" style={{ color: "#fff" }}>
  <span className="me-3">{userDetails.Name}</span>
  <span className="me-3">|</span>
  <span className="me-3"> Balance: {xrpBalance / 1000000} XRP</span>
</div>

          {/* Nav Tabs */}
          <div className="justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/userdashboard/booking" className="nav-link">
                  Book a Court
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/userdashboard/myBookings" className="nav-link">
                    My Bookings
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/userdashboard/profile" className="nav-link">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>


    </div>
  );
};

export default UserNavbar;
