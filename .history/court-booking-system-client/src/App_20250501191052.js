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

import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const { web3Authorized, userInfo } = useSelector((state) => state.auth);

  const [isHotPocketConnected, setIsHotPocketConnected] = useState(false);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [userExists, setUserExists] = useState(false);

  // Initialize HotPocket when web3Authorized is true
  useEffect(() => {
    if (web3Authorized) {
      console.log("Initializing HotPocket...");
      const initHotPocket = async () => {
        const connected = await hotPocketService.initialize();
        setIsHotPocketConnected(connected);
      };

      initHotPocket();
    }
  }, [web3Authorized]);

  // Check if user exists after HotPocket is connected
  useEffect(() => {
    const checkUserExistence = async () => {
      if (isHotPocketConnected && userInfo?.email) {
        try {
          console.log("userInfo:", userInfo);
          const res = await userService.checkUser(userInfo?.email);
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

  // Show loading state while initializing HotPocket or checking user existence
  if (web3Authorized && (!isHotPocketConnected || !isUserChecked)) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <div className="grid">
          <Routes>
            {/* Route for unauthorized users */}
            {!web3Authorized && <Route path="/" element={<Web3AuthPage />} />}

            {/* Routes for authorized users */}
            {web3Authorized && (
              <>
                {/* Redirect to SignUp if user does not exist */}
                {!userExists && <Route path="/" element={<Navigate to="/signup" />} />}

                {/* Redirect to Dashboard if user exists */}
                {userExists && <Route path="/" element={<Navigate to="/dashboard" />} />}

                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<DashboardNavbar />}>
                  {/* Uncomment if you want to show ProfileInfo by default */}
                  <Route path="" element={<ProfileInfo />} /> 
                  <Route path="court" element={<CreateCourt/>} />

                </Route>
              </>
            )}

            {/* Fallback route for invalid paths */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;