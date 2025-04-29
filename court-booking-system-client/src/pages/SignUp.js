import userService from "../services/domain-services/UserService";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";
import { setUserDetails } from "../store/slices/userSlice";

const SignUp = () => {
    const dispatch = useDispatch();

    const { userInfo, provider } = useSelector((state) => state.auth);
    const { xrplAccount } = useSelector((state) => state.wallet);

    const fetchUserAccount = async () => {
        const rpc = new XrplService(provider);
        const userAccount = await rpc.getAccounts();
        return userAccount?.account;
    };

    let xrplAccountAddress;

    const getXrplAccountAddress = async () => {
        if (xrplAccount && xrplAccount.Account) {
            return xrplAccount?.Account;
        } else {
            return await fetchUserAccount();
        }
    };

    useEffect(() => {
        const fetchAddress = async () => {
            const address = await getXrplAccountAddress();
            setFormData((prevData) => ({
                ...prevData,
                xrplAddress: address || prevData.xrplAddress,
            }));
        };
        fetchAddress();
    }, [xrplAccount, userInfo]);

    const [formData, setFormData] = useState({
        xrplAddress: xrplAccountAddress || "",
        email: userInfo?.email || "",
        name: userInfo?.name || "",
        userRole: "Donor",
        description: "",
        lat: "",
        lng: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            xrplAddress: xrplAccountAddress || prevData.xrplAddress,
            email: userInfo?.email || prevData.email,
            name: userInfo?.name || prevData.name,
        }));
    }, [userInfo, xrplAccountAddress]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await userService.registerUser(formData);

            if (response.success) {
                setSuccessMessage(response.success.message);
                const userDetails = {
                    XrplAddress: formData.xrplAddress,
                    Email: formData.email,
                    Name: formData.name,
                    UserRole: formData.userRole,
                    Description: formData.description,
                    Lat: formData.lat,
                    Lng: formData.lng,
                };
                dispatch(setUserDetails(userDetails));
                console.log("User details saved to Redux:", userDetails);
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // Redirect after 1 second
            } else {
                setError("Failed to register user. Please try again.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            setError("An error occurred while registering the user.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Sign Up</h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* XRPL Address Field */}
                <div className="mb-3">
                    <label htmlFor="xrplAddress" className="form-label">XRPL Address</label>
                    <input
                        type="text"
                        name="xrplAddress"
                        id="xrplAddress"
                        value={formData.xrplAddress}
                        className="form-control"
                        readOnly
                        disabled
                    />
                </div>

                {/* Email Field */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        className="form-control"
                        readOnly
                        disabled
                    />
                </div>

                {/* User Role Field */}
                <div className="mb-3">
                    <label htmlFor="userRole" className="form-label">User Role</label>
                    <select
                        name="userRole"
                        id="userRole"
                        value={formData.userRole}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        <option value="Donor">Donor</option>
                        <option value="FoodRecipient">Food Recipient</option>
                        <option value="FoodProvider">Food Provider</option>
                    </select>
                </div>

                {/* Description Field */}
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Latitude Field */}
                <div className="mb-3">
                    <label htmlFor="lat" className="form-label">Latitude</label>
                    <input
                        type="text"
                        name="lat"
                        id="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Longitude Field */}
                <div className="mb-3">
                    <label htmlFor="lng" className="form-label">Longitude</label>
                    <input
                        type="text"
                        name="lng"
                        id="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Sign Up"}
                </button>

                {/* Error and Success Messages */}
                {error && <p className="text-danger mt-3">{error}</p>}
                {successMessage && <p className="text-success mt-3">{successMessage}</p>}
            </form>
        </div>
    );
};

export default SignUp;