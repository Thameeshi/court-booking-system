import React, { useState } from "react";
import "../styles/EditProfile.css";

const EditProfile = () => {
  // State for form inputs
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("/default-user.png"); // preview URL
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePic(previewUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a server or update global state

    // For demonstration, just alert or console log the data
    alert(`Saved!\nName: ${name}\nBio: ${bio}\nFile selected: ${selectedFile?.name || "No file"}`);
    
    // TODO: reset or do whatever after saving
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          rows="4"
          placeholder="Tell us about yourself"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label>Profile Picture</label>
        <img
          src={profilePic}
          alt="Profile Preview"
          className="profile-picture-preview"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
