import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/slices/userSlice";
import userService from "../services/domain-services/UserService";

const SignUp = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        xrplAddress: "",
        email: "",
        name: "",
        userRole: "CourtOwner", // Default role
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userService.registerUser(formData);
            if (response.success) {
                dispatch(setUserDetails(formData));
                alert("Registration successful!");
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="container mt-5">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
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
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="xrplAddress" className="form-label">XRPL Address</label>
                    <input
                        type="text"
                        name="xrplAddress"
                        id="xrplAddress"
                        value={formData.xrplAddress}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="userRole" className="form-label">Role</label>
                    <select
                        name="userRole"
                        id="userRole"
                        value={formData.userRole}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        <option value="PublicUser">Public User</option>
                        <option value="CourtOwner">Court Owner</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;