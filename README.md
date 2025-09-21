# 🏟️ Courtify – Decentralized Court Booking System

Courtify is a comprehensive decentralized court booking platform designed to simplify and modernize the management and reservation of sports courts. Built as a second-year Software Development project, Courtify integrates cutting-edge blockchain technology, cloud-based image hosting, and smart contract backends to deliver a trustworthy, transparent, and user-friendly experience for court owners, players, and administrators.

---

## Overview

The platform empowers court owners to easily create and manage their courts by providing detailed information such as court name, sport type, location, pricing, amenities, and up to three high-quality images per court. These images are securely stored and delivered using **Cloudinary**, ensuring fast loading times and reliable availability.

Court owners can define availability by specifying dates and time slots. Each available slot can be minted as a **non-fungible token (NFT)** on the **XRP Ledger (XRPL)** via **HotPocket smart contracts**, providing tamper-proof proof of booking and increasing trust between court owners and players.

Public users can browse and search courts by location, sport, or price, view real-time availability, book slots, and receive NFTs as immutable proof of their reservations. Users can also cancel bookings, burning the corresponding NFT to trigger refunds, ensuring a seamless and transparent booking experience.

An intelligent **chatbot** guides users and court owners through tasks such as searching courts, booking slots, managing courts, and understanding platform policies, enhancing the overall user experience.

---

## Key Features

### Court Owner Features
- Create, update, and delete court listings with detailed metadata.
- Upload and manage up to three images per court using **Cloudinary**.
- Define availability with specific dates and time slots.
- Mint NFTs for booking slots on the XRPL, uniquely identifying reservations.
- View detailed booking statistics, including court popularity and user engagement.
- Remove courts with documented reasons to maintain listing quality.

### Public User Features
- Browse and filter courts by location, sport, and price.
- View real-time court availability.
- Book courts and receive NFTs as secure booking confirmations.
- Cancel bookings with automatic NFT burning to process refunds.
- Interact with a chatbot for assistance on booking, payments, and platform usage.

### Administrator Features
- Full visibility of all courts and users on the platform.
- Delete any court or user to enforce platform policies.
- Monitor booking trends and user activity via dashboards.

### Additional Features
- **Chatbot:** AI-powered assistant for FAQs and guidance.
- **Booking Statistics Dashboard:** Real-time analytics with charts for court owners and admins.
- **NFT Integration:** Uses XRPL blockchain to mint and burn NFTs, securing booking transactions.

---

## How It Works (Summary)

1. Court owners create listings, upload images, and set available booking slots.  
2. Availability slots are minted as NFTs on the XRPL blockchain.  
3. Users browse available courts, book slots, and receive NFTs as proof.  
4. Bookings can be canceled by burning NFTs, triggering refunds.  
5. Chatbot provides guidance and support at every step.  
6. Administrators manage overall platform health, user moderation, and analytics.

---

## Technical Architecture

- **Frontend:** React.js, CSS Modules, Redux Toolkit  
- **Backend:** Node.js, HotPocket smart contracts (XRPL integration)  
- **Blockchain:** XRP Ledger (XRPL) for NFT minting and booking verification  
- **Image Hosting:** Cloudinary  
- **Communication:** HotPocket decentralized messaging system  
- **AI Chatbot:** Custom chatbot for user assistance and FAQs  

The platform emphasizes decentralization and blockchain technology to provide transparent booking verification, prevent double-bookings, and enhance user trust.

---

## Project Purpose and Impact

Courtify was developed as part of a second-year Software Development curriculum to explore the integration of blockchain technology with modern web development. The project demonstrates:

- Transparent, trustless booking systems using NFTs.  
- Immutable proof of reservations to prevent fraud.  
- A clean, intuitive UI for a seamless booking experience.

---

## Developed By

This project was developed by second-year **Information Technology and Management** students from the **Faculty of IT, University of Moratuwa**, mentored by **Geveo Australasia (Pvt) Ltd**.
