import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

const ProfileInfo = () => {
  const { provider } = useSelector((state) => state.auth);
  const userDetails = useSelector((state) => state.user.userDetails);
  const provider = useSelector((state) => state.auth.provider);

  const [nftTokenId, setNftTokenId] = useState("");
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
=======
  const [tokenId, setTokenId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [burnNotification, setBurnNotification] = useState(null);
  const [buyNotification, setBuyNotification] = useState(null);
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142

  const handleCreateSellOffer = async () => {
    if (!nftTokenId) {
      alert("Please enter a valid NFT Token ID.");
      return;
    }
    try {
      setLoading(true);
      const xrpl = new XrplService(provider);
<<<<<<< HEAD
      const response = await xrpl.createSellOffer(nftTokenId, 1.0, "Court booking sell offer");
      console.log("Sell offer response:", response);
      setMessage("Sell offer created successfully!");
=======
      await xrpl.createSellOffer(nftTokenId, 1.0, "Court booking sell offer");
      setMessage("Sell offer created successfully!");
      setNftTokenId("");
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
    } catch (err) {
      console.error(err);
      setMessage("Failed to create sell offer.");
    } finally {
      setLoading(false);
<<<<<<< HEAD
      setNftTokenId("");
=======
    }
  };

  const handleBurnNFT = async () => {
    setBurnNotification(null);
    if (!tokenId) {
      setBurnNotification({ type: "error", message: "Please enter a valid Token ID" });
      return;
    }
    try {
      const rpc = new XrplService(provider);
      await rpc.burnNFT(tokenId);
      setBurnNotification({ type: "success", message: "NFT burned successfully" });
      setTokenId("");
    } catch (error) {
      console.error("Error burning NFT:", error);
      setBurnNotification({ type: "error", message: "Failed to burn NFT" });
    }
  };

  const handleBuySellOffer = async () => {
    setBuyNotification(null);
    if (!offerId) {
      setBuyNotification({ type: "error", message: "Please enter a valid Offer ID" });
      return;
    }
    try {
      const rpc = new XrplService(provider);
      await rpc.acceptSellOffer(offerId);
      setBuyNotification({ type: "success", message: "Sell offer accepted successfully" });
      setOfferId("");
    } catch (error) {
      console.error("Error buying offer:", error);
      setBuyNotification({ type: "error", message: "Failed to buy sell offer" });
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
    }
  };

  if (!userDetails) {
    return (
<<<<<<< HEAD
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
=======
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 18,
        color: "#555",
      }}>
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
        No user details found.
      </div>
    );
  }

  return (
<<<<<<< HEAD
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

=======
    <div style={{
      minHeight: "100vh",
      backgroundColor: "rgba(14, 99, 4, 0.1)",
      padding: 40,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 20,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
        maxWidth: 900,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        overflow: "hidden",
      }}>
        <div style={{
          backgroundColor: "rgba(14, 99, 4, 0.15)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}>
          <img
            src={userDetails.imageUrl || "/default-user.png"}
            alt="Profile"
            style={{ borderRadius: "50%", width: 140, height: 140, objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "40px 60px", color: "#0e6304" }}>

          <section style={{ marginBottom: 40, borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 20 }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: 18, fontWeight: "600" }}>Profile Information</h2>
            <dl style={{ fontSize: 18, lineHeight: 1.6 }}>
              <dt style={{ fontWeight: "700" }}>Name:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.Name}</dd>
              <dt style={{ fontWeight: "700" }}>Email:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.Email}</dd>
              <dt style={{ fontWeight: "700" }}>Role:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.UserRole}</dd>
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
              <dt style={{ fontWeight: "700" }}>XRPL Address:</dt>
              <dd>{userDetails.XrplAddress}</dd>
            </dl>
          </section>
<<<<<<< HEAD

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

=======

          <section>
            <h3 style={{ fontSize: "1rem", marginBottom: 20, fontWeight: "600", borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 10 }}>
              Fund Your XRPL Account
            </h3>
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
            <a
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#850c0cff",
                color: "#fff",
<<<<<<< HEAD
                padding: "10px 24px",
                borderRadius: 12,
                fontWeight: "600",
                fontSize: 16,
                textDecoration: "none",
                marginBottom: 16,
=======
                padding: "14px 32px",
                borderRadius: 12,
                fontWeight: "600",
                fontSize: 18,
                textDecoration: "none",
                marginBottom: 20,
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
              }}
            >
              Fund Account
            </a>
          </section>

<<<<<<< HEAD
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
=======

          {/* Burn NFT */}
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: 12 }}>Burn NFT</h3>
            <input
              type="text"
              placeholder="Enter Token ID to Burn"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc", width: "100%", marginBottom: 10 }}
            />
            <button
              onClick={handleBurnNFT}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: "600",
                fontSize: 16,
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
                border: "none",
                cursor: "pointer",
              }}
            >
<<<<<<< HEAD
              {loading ? "Creating..." : "Create Sell Offer"}
            </button>

            {message && <p style={{ marginTop: 10, fontSize: 14 }}>{message}</p>}
=======
              Burn NFT
            </button>
            {burnNotification && (
              <p style={{ color: burnNotification.type === "success" ? "green" : "red", marginTop: 10 }}>
                {burnNotification.message}
              </p>
            )}
          </section>

          {/* Buy Offer */}
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: 12 }}>Buy Sell Offer</h3>
            <input
              type="text"
              placeholder="Enter Offer ID"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc", width: "100%", marginBottom: 10 }}
            />
            <button
              onClick={handleBuySellOffer}
              style={{
                backgroundColor: "#198754",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: "600",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              Buy Offer
            </button>
            {buyNotification && (
              <p style={{ color: buyNotification.type === "success" ? "green" : "red", marginTop: 10 }}>
                {buyNotification.message}
              </p>
            )}
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
