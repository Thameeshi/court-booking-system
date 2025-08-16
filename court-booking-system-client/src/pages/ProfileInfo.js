import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

const ProfileInfo = () => {
  const userDetails = useSelector((state) => state.user.userDetails);
  const provider = useSelector((state) => state.auth.provider);

  const [nftTokenId, setNftTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateSellOffer = async () => {
    if (!nftTokenId) {
      alert("Please enter a valid NFT Token ID.");
      return;
    }
    try {
      setLoading(true);
      const xrpl = new XrplService(provider);
      const response = await xrpl.createSellOffer(nftTokenId, 1.0, "Court booking sell offer");
      console.log("Sell offer response:", response);
      setMessage("Sell offer created successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create sell offer.");
    } finally {
      setLoading(false);
      setNftTokenId("");
    }
  };

  if (!userDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 16,
          color: "#555",
        }}
      >
        No user details found.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "rgba(14, 99, 4, 0.1)",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          maxWidth: 700,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          overflow: "hidden",
        }}
      >
        {/* Left panel: heading + profile picture */}
        <div
          style={{
            backgroundColor: "rgba(14, 99, 4, 0.15)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            gap: 24,
          }}
        >
          <h1
            style={{
              color: "#0e6304",
              fontWeight: "700",
              fontSize: "2rem",
              margin: 0,
              textAlign: "center",
              userSelect: "none",
            }}
          >
            My Profile
          </h1>

          <img
            src={userDetails.imageUrl || "/default-user.png"}
            alt="Profile"
            style={{ borderRadius: 20, width: 120, height: 120, objectFit: "cover" }}
          />
        </div>

        {/* Right panel: profile details and actions */}
        <div style={{ padding: "24px 36px", color: "#0e6304" }}>
          <section
            style={{
              marginBottom: 32,
              borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
              paddingBottom: 16,
            }}
          >
            <h2 style={{ fontSize: "1.4rem", marginBottom: 12, fontWeight: "600" }}>
              Profile Information
            </h2>
            <dl style={{ fontSize: 16, lineHeight: 1.5 }}>
              <dt style={{ fontWeight: "700" }}>Name:</dt>
              <dd style={{ marginBottom: 8 }}>{userDetails.Name}</dd>

              <dt style={{ fontWeight: "700" }}>Email:</dt>
              <dd style={{ marginBottom: 8 }}>{userDetails.Email}</dd>

              <dt style={{ fontWeight: "700" }}>Role:</dt>
              <dd style={{ marginBottom: 8 }}>{userDetails.UserRole}</dd>

              <dt style={{ fontWeight: "700" }}>XRPL Address:</dt>
              <dd>{userDetails.XrplAddress}</dd>
            </dl>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3
              style={{
                fontSize: "1.3rem",
                marginBottom: 16,
                fontWeight: "600",
                borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
                paddingBottom: 8,
              }}
            >
              Fund Your XRPL Account
            </h3>

            <a
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#850c0cff",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 12,
                fontWeight: "600",
                fontSize: 16,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              Fund Account
            </a>
          </section>

          <section>
            <h3
              style={{
                fontSize: "1.3rem",
                marginBottom: 16,
                fontWeight: "600",
                borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
                paddingBottom: 8,
              }}
            >
              Create Sell Offer
            </h3>

            <input
              type="text"
              placeholder="Enter NFT Token ID"
              value={nftTokenId}
              onChange={(e) => setNftTokenId(e.target.value)}
              style={{
                padding: 8,
                fontSize: 14,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 10,
                width: "100%",
              }}
            />

            <button
              onClick={handleCreateSellOffer}
              disabled={!nftTokenId || loading}
              style={{
                backgroundColor: "#143da2ff",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 6,
                fontWeight: "600",
                fontSize: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading ? "Creating..." : "Create Sell Offer"}
            </button>

            {message && <p style={{ marginTop: 10, fontSize: 14 }}>{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
