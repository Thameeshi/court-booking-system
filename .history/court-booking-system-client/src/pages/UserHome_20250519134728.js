import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../component/Navbar.js";
import Footer from "../component/Footer/footer";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image 3.jpg";
import UserCourtList from "../component/UserCourtList";
import SearchBar from "../component/SearchBar";
import "../styles/HomePage.css";

const UserHome = () => {
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    const filtered = courts.filter(
      (court) =>
        (court.Name || "").toLowerCase().includes(name.toLowerCase()) &&
        (court.Type || "").toLowerCase().includes(sport.toLowerCase()) &&
        (court.Location || "").toLowerCase().includes(location.toLowerCase())
    );
    setFilteredCourts(filtered);
  }, [name, sport, location, courts]);

  const fetchCourts = async () => {
    try {
      const response = await axios.get("/api/courts"); // Use relative path for proxy support
      setCourts(response.data);
      setFilteredCourts(response.data);
    } catch (error) {
      console.error("❌ Error fetching courts:", error.response?.data || error.message);
    }
  };

  const handleClearFilters = () => {
    setName("");
    setSport("");
    setLocation("");
  };

  return (
    <div className="home">
      <Navbar />

      <header className="header">
        <div className="header-content-wrapper">
          <div className="header-content">
            <SearchBar
              name={name}
              setName={setName}
              sport={sport}
              setSport={setSport}
              location={location}
              setLocation={setLocation}
              handleClearFilters={handleClearFilters}
            />

            <div className="header-text">
              <h1 className="animated-text">
                <span>Find</span> | <span>Book</span> <span>and</span>{" "}
                <span>Play</span>
                <span> Anytime,</span> <span>Anywhere</span>
              </h1>
              <button className="get-started-btn" onClick={() => navigate("/userdashboard/booking")}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="welcome-section flex flex-col md:flex-row items-center justify-center gap-8 p-8 bg-gray-50">
        <div className="relative w-full md:w-1/2 flex justify-center">
          <div className="relative flex">
            <img src={image3} alt="Background" className="image3" />
            <div className="image2-wrapper absolute top-0 left-0">
              <img src={image2} alt="Foreground" className="image2" />
            </div>
          </div>
        </div>

        <div className="welcome-text-box w-625 h-500 bg-white shadow-lg rounded-lg p-6 md:p-8 flex flex-col justify-center items-center text-center">
          <p className="text-black font-semibold italic text-xl">
            <span className="text-green-600">WELCOME TO COURTIFY</span>
          </p>
          <p className="text-black1 font-semibold italic text-xl mt-2">
            COURTS AT YOUR <span className="text-green-600">FINGERTIPS</span>
          </p>
          <p className="text-black2 font-semibold italic text-xl mt-4">
            At <span className="text-green-600">COURTIFY</span>, we’re rewriting the rules of sports court bookings.
            Say goodbye to the hassle – with just a few clicks, you can find, book, and play. From real-time availability
            to secure NFT confirmations, we’re here to turn your game-time dreams into reality. Let’s make every play
            unforgettable!
          </p>
          <button className="about-us-btn mt-6" onClick={() => navigate("/about-us")}>
            ABOUT US
          </button>
        </div>
      </section>

      <UserCourtList courts={filteredCourts} />

      <Footer />
    </div>
  );
};

export default UserHome;