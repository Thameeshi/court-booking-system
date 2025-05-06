import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const UserNavbar = () => {
  const userDetails = useSelector((state) => state.user.userDetails);
  const { xrpBalance } = useSelector((state) => state.wallet);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark vw-100">
        <div className="container-fluid">
          <Link to="/userdashboard" className="navbar-brand">
            Book My Court
          </Link>
          <div className="d-none d-lg-flex align-items-center text-info ml-2">
            <span className="me-3">{userDetails?.Name}</span>
            <span className="me-3">|</span>
            <span className="me-3"> Balance: {xrpBalance / 1000000} XRP</span>
          </div>
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
                <Link to="/dashboard/profile" className="nav-link">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default UserNavbar;