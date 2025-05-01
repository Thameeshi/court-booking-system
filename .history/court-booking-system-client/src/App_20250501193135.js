import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import userService from "./services/domain-services/UserService.js";
import hotPocketService from "./services/common-services/HotPocketService";
import { setUserDetails } from "./store/slices/userSlice.js";

import Web3AuthPage from "./pages/Web3AuthPage.tsx";
import SignUp from "./pages/SignUp.js";
import DashboardNavbar from "./components/DashboardNavbar.js";
import ProfileInfo from "./pages/ProfileInfo.js";
import CreateCourt from "./pages/CreateCourt.js";
import ManageCourt from "./pages/ManageCourt.js";
// Make sure this component exists
import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const { web3Authorized, userInfo } = useSelector((state) => state.auth);
  const { userDetails } = useSelector((state) => state.user);

  const [isHotPocketConnected, setIsHotPocketConnected] = useState(false);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    if (web3Authorized) {
      const initHotPocket = async () => {
        const connected = await hotPocketService.initialize();
        setIsHotPocketConnected(connected);
      };
      initHotPocket();
    }
  }, [web3Authorized]);

  useEffect(() => {
    const checkUserExistence = async () => {
      if (isHotPocketConnected && userInfo?.email) {
        try {
          const res = await userService.checkUser(userInfo.email);
          if (res.success) {
            setUserExists(true);
            dispatch(setUserDetails(res.success[0]));
          } else {
            setUserExists(false);
          }
        } catch (error) {
          console.error("Error checking user:", error);
        } finally {
          setIsUserChecked(true);
        }
      }
    };
    checkUserExistence();
  }, [isHotPocketConnected, userInfo, dispatch]);

  if (web3Authorized && (!isHotPocketConnected || !isUserChecked)) {
    return <div>Loading...</div>;
  }

  const userRole = userDetails?.userRole || "PublicUser";

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {!web3Authorized && <Route path="/" element={<Web3AuthPage />} />}

          {web3Authorized && (
            <>
              <Route path="/" element={<Navigate to={userExists ? "/dashboard" : "/signup"} />} />
              <Route path="/signup" element={<SignUp />} />

              <Route path="/dashboard" element={<DashboardNavbar />}>
                <Route index element={<ProfileInfo />} />
                <Route path="profile" element={<ProfileInfo />} />
                <Route path="court" element={<CreateCourt />} />
                <Route path="myCourts" element={<ManageCourt />} />

                {userRole === "CourtOwner" && (
                  <>
                    <Route path="manageCourts" element={<ManageCourt />} />
                   
                  </>
                )}
              </Route>
            </>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;