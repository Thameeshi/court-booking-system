import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const DashboardNavbar = () => {
  const userDetails = useSelector((state) => state.user.userDetails);
  const { xrpBalance } = useSelector((state) => state.wallet);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark vw-100">
        <div className="container-fluid">
          {/* Brand/Title */}
          <Link to="/dashboard" className="navbar-brand">
            Food Waste Reduction Platform
          </Link>

          {/* User Details and Balance (hidden on small screens) */}
          <div className="d-none d-lg-flex align-items-center text-info ml-2">
            <span className="me-3">
              {userDetails.Name}
            </span>
            <span className="me-3">|</span>
            <span className="me-3"> Balance: {xrpBalance / 1000000} XRP</span>
          </div>

          {/* Nav Tabs (always visible) */}
          <div className="justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/dashboard/profile" className="nav-link">
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/dashboard/donationReq" className="nav-link">
                  Donation Request
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/dashboard/donation" className="nav-link">
                  Donations
                </Link>
              </li>
              {/* Add more navigation links here */}
            </ul>
          </div>
        </div>
      </nav>

      {/* Content area for nested routes */}
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardNavbar;