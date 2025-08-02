import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../store/slices/userSlice";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails);

  const [name, setName] = useState(userDetails?.Name || "");
  const [bio, setBio] = useState(userDetails?.bio || "");
  const [profilePic, setProfilePic] = useState(userDetails?.imageUrl || "/default-user.png");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfilePic(previewUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUserDetails = {
      ...userDetails,
      Name: name,
      bio: bio,
      imageUrl: profilePic,
    };

    dispatch(setUserDetails(updatedUserDetails));
    localStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));

    console.log("Updated userDetails dispatched:", updatedUserDetails);
    alert("Profile updated!");
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-pic-wrapper top-center">
        <img
          src={profilePic}
          alt="Profile Preview"
          className="profile-picture-preview"
        />
      </div>

      <h2>Edit Profile</h2>

      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Bio</label>
        <textarea
          rows="4"
          placeholder="Tell us about yourself"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
