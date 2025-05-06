import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/slices/userSlice";
import userService from "../services/domain-services/UserService";

const Web3AuthPage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userInfo = await userService.getLoggedInUser();
                if (userInfo.success) {
                    dispatch(setUserDetails(userInfo.success));
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        fetchUserDetails();
    }, [dispatch]);

    return <div>Loading...</div>;
};

export default Web3AuthPage;