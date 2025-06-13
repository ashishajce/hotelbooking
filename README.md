# hotelbooking
Hotel Booking
<h1 align="center">🏨 Hotel Booking Backend</h1>

<p align="center">
  A robust, secure, and scalable backend system for managing hotel room bookings. Built using <b>Node.js</b>, <b>Express.js</b>, and <b>MongoDB</b>. Includes authentication, admin operations, room management, and booking workflows.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16.x-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-^4.18.2-lightgrey" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-%5E5.0-success" alt="MongoDB">
  <img src="https://img.shields.io/badge/Postman-Tested-orange" alt="Postman">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [⚙️ Getting Started](#️-getting-started)
- [🔐 Authentication Flow](#-authentication-flow)
- [📮 API Endpoints](#-api-endpoints)
- [📁 Project Structure](#-project-structure)
- [🧪 Postman Collection](#-postman-collection)
- [🚀 Future Enhancements](#-future-enhancements)
- [📄 License](#-license)

---

## ✨ Features

### 👤 User Module
- Email OTP verification
- JWT-based login and secure booking access
- Book hotel rooms with check-in and check-out
- View personal booking history

### 🛠 Admin Module
- Admin-only routes with secure JWT authentication
- Add new room categories
- View all bookings
- Manage user bookings

---

## 🧰 Tech Stack

| Category      | Technologies |
|---------------|--------------|
| **Runtime**   | Node.js      |
| **Framework** | Express.js   |
| **Database**  | MongoDB with Mongoose |
| **Auth**      | JWT + bcrypt |
| **Email**     | Nodemailer (for OTP) |
| **Testing**   | Postman      |

---

## ⚙️ Getting Started

### 📦 Prerequisites
- Node.js ≥ 16.x
- MongoDB (local or MongoDB Atlas)
- Postman (for API testing)

### 🛠 Installation

```bash
git clone https://github.com/ashishajce/hotelbooking.git
cd hotelbooking
npm install
