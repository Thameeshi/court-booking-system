import React from "react";
import "../styles/WalletManagement.css";

const WalletManagement = () => {
  return (
    <div className="wallet-page-container">
      <div className="wallet-balance">
        Current Balance: <strong>125.00 XRP</strong>
      </div>

      <div className="transaction-history">
        <h3>Transaction History</h3>
        <div className="transaction-item">+50 XRP - Received</div>
        <div className="transaction-item">-25 XRP - Booking Payment</div>
        <div className="transaction-item">+100 XRP - Added to Wallet</div>
      </div>
    </div>
  );
};

export default WalletManagement;
