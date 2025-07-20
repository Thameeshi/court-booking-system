import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

const ProfileInfo = () => {
  const { provider } = useSelector((state) => state.auth);
  const userDetails = useSelector((state) => state.user.userDetails);
  const [tokenId, setTokenId] = useState("");
  const [offerId, setOfferId] = useState("");

  const handleBurnNFT = async () => {
    if (!tokenId) {
      alert("Please enter a valid Token ID");
      return;
    }

    try {
      const rpc = new XrplService(provider);
      const result = await rpc.burnNFT(tokenId);
      console.log(`NFT burned successfully: ${result}`);
      setTokenId("");
    } catch (error) {
      console.error("Error burning NFT:", error);
    }
  };

  const handleBuySellOffer = async () => {
    if (!offerId) {
      alert("Please enter a valid Offer ID");
      return;
    }

    try {
      const rpc = new XrplService(provider);
      const result = await rpc.acceptSellOffer(offerId);
      console.log(`Offer bought:`,result);
      setOfferId("");
    } catch (error) {
      console.error("Error buying offer:", error);
    }
  };

  if (!userDetails) {
    return <div className="alert alert-warning">No user details found.</div>;
  }

  return (
    <div className="container mt-10" style={{
      flex: 1,
          backgroundColor: "rgba(255, 255, 252, 0.94)", // your preferred color
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px" 
         }}>
          <h1 className="mb-4" style={{ color: "#0e6304" }}>My Profile</h1> 
      <div className="card p-4 shadow-l">
        <div className="card-body">
          <h2 className="card-title mb-3" style={{ color: "#0e6304", fontSize:"25px", justifySelf:"center" }} >Profile Information</h2>
          <br></br>
          <div className="mb-3">
            <p><strong>Name:</strong> {userDetails.Name}</p>
            <p><strong>Email:</strong> {userDetails.Email}</p>
            <p><strong>Role:</strong> {userDetails.UserRole}</p>
            <p><strong>XRPL Address:</strong> {userDetails.XrplAddress}</p>
            
          </div>

          
          <br></br>

          <h3 className="mb-3" style={{ color: "#0e6304", fontSize:"25px",justifySelf:"center" }} >Dev Tools</h3>
          <br></br>
          <div className="mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <button className="btn btn-danger" onClick={handleBurnNFT} style={{
              width:"100%",
              padding: "3px",
              fontSize: "14px"
            }} >
              Burn NFT
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Sell Offer ID"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleBuySellOffer} style={{
              width:"100%",
              padding: "3px",
              fontSize: "14px"
            }}>
              Buy Sell Offer
            </button>
          </div>

          <div className="mb-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              className="btn btn-secondary" style={{
              width:"100%",
              padding: "3px",
              fontSize: "14px"
            }}
            >
              Fund Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
