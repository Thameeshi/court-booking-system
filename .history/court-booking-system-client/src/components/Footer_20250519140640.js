import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h3>QUICK LINKS</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Book a Court</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>SUPPORT</h3>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>CONTACT DETAILS</h3>
          <ul>
            <li>Email: courtify@gmail.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address:</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>SOCIAL MEDIA LINKS</h3>
          <div className="social-icons">
            <a href="#"><img src="/facebook.png" alt="Facebook" /></a>
            <a href="#"><img src="/twitter.png" alt="Twitter" /></a>
            <a href="#"><img src="/instagram.png" alt="Instagram" /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Stay updated with our latest offers and courts!</p>
        <p>© 2024 Courtify. All Rights Reserved.</p>
        <div className="payment-icons">
          <img src="/visa.png" alt="Visa" />
          <img src="/nft.png" alt="NFT" />
          <img src="/card.png" alt="MasterCard" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;