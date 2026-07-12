# 🎓 NIBM Canteen-Zero: The Digital Campus Dining Revolution

![NIBM Banner](https://www.nibm.lk/wp-content/themes/nibm/images/logo.png)

> **"The Place To Be"** — Now with a Zero-Queue, 100% Cashless, and Smart Seating digital experience.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nethru/NIBM-Canteen-Zero)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/nethru/NIBM-Canteen-Zero/pulls)
[![Quality Standard](https://img.shields.io/badge/Quality-Diamond%20Tier-orange.svg)]()

## 🚀 Project Overview
**NIBM Canteen-Zero** is an enterprise-grade MERN stack application designed to solve the chronic congestion at the NIBM Colombo (Vidya Mawatha) canteen. By digitizing the entire lifecycle of an order—from classroom selection to physical seat release—the system ensures a "Zero-Queue" environment through real-time orchestration.

### 🌟 Key Innovations
*   **LANKAQR Fintech Integration:** A simulated secure gateway with MD5 signature verification.
*   **Smart Seating Orchestration:** A logic-driven counter that manages NIBM's 40-seat capacity using category-aware auto-release timers (12m for snacks / 25m for meals).
*   **Live Fulfillment Stream:** Real-time bi-directional synchronization between students and kitchen staff using WebSockets.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js v18** | High-performance Component-based UI. |
| **State Management** | **Zustand** | Persistent cross-session global state. |
| **Styling** | **Tailwind CSS v3** | Professional academic-themed responsive design. |
| **Backend** | **Node.js / Express.js** | Scalable RESTful API & logic orchestration. |
| **Database** | **MongoDB Atlas** | Shared team cloud database. |
| **Real-time** | **Socket.io** | Bi-directional event streaming for alerts & seating. |
| **Media Storage** | **Cloudinary** | Global CDN for high-availability food assets. |
| **Testing** | **Jest / Supertest** | Automated logic & API validation. |

---

## 💎 Core Features

### 🔐 Identity & Access (US 01, 02, 03)
*   **Domain Gating:** Registration restricted exclusively to `@nibm.lk` email addresses.
*   **Role-Based Security:** Dynamic redirection for **Students** (Menu) and **Staff** (Admin Dashboard).
*   **Advanced Encryption:** Industry-standard password hashing using **Bcrypt.js** and session management via **JWT**.

### 🍕 Discovery & Selection (US 04, 05, 06, 07)
*   **Dynamic Inventory:** Image-rich catalog with metadata (🌶️ Spice levels, ⏱️ Prep times).
*   **Intelligent Filtering:** Multi-dimensional sorting by Price, Prep Time, and Category.
*   **Fuzzy Search:** Real-time text filtering for instant food discovery.

### 💳 Transaction Processing (US 08, 09, 10, 11)
*   **Persistent Basket:** Cart data survives browser refreshes and session drops.
*   **Fintech Simulation:** Dynamic LANKAQR generation with automated polling for bank confirmation.
*   **Digital Receipts:** High-contrast 4-digit Pickup Tokens with an "Export to Gallery" feature.

### 👨‍🍳 Operational Administration (US 15, 16, 22, 23, 25)
*   **Kitchen Monitor:** Dark-themed industrial dashboard with FIFO queue logic and audio-visual alerts.
*   **Inventory Switchboard:** Instant "Snooze" toggle to hide sold-out items from students in real-time.
*   **Business Intelligence:** Daily revenue aggregation with automated PDF reporting for management.

### 🪑 Smart Space Management (US 17, 18, 19, 20, 21, 24)
*   **Capacity Hard-Lock:** Prevents Dine-In orders when the 40-seat limit is reached.
*   **Temporal Auto-Release:** Backend timers automatically clear digital seats based on meal type.
*   **Interactive Handshake:** Students can manually release seats early via simulated Table QR scanning.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js (LTS Version)
*   npm or yarn
*   MongoDB Compass (Optional - for local viewing)

### 2. Environment Configuration
Create a `.env` file in the **backend** folder:
```text
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/nibm_canteen_db
JWT_SECRET=your_secure_random_string
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
PAYHERE_SECRET=your_gateway_secret
```

Create a `.env` file in the **frontend** folder:
```text
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NOTIFICATION_SOUND=https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3
```

### 3. Execution
**Backend:**
```bash
cd backend
npm install
node server.js
```
**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🧪 Quality Assurance (Testing)

The project maintains a **100% Logic Pass Rate** verified by automated testing.

*   **Backend Tests:** `npm test` inside `/backend` (Tests: Auth, Security, Logic, Sockets).
*   **Frontend Tests:** `npm test` inside `/frontend` (Tests: Store, UI, Routing).

---

## 📅 Development Roadmap (Scrum Sprints)

*   **Sprint 1: The Foundation** — Login, Menu Discovery, Cart, and LANKAQR Payment.
*   **Sprint 2: The Fulfillment** — Kitchen Monitor, Token Generation, and Real-time Alerts.
*   **Sprint 3: The Orchestration** — Smart Seating, Auto-Release Timers, and BI Reports.

---

## 👥 Contributors (NIBM Group K)
*   **Nethru Wickramasekara** — Lead Full-Stack Developer & Architect.
*   **Hiruni Hapuarachchi** — Lead Full-Stack Developer & Architect.
*   **Dilshan Sathsara** — Full-Stack Developer & Architect.
*   **Senidu Senanayake** — Full-Stack Developer & Architect.
*   **Maithrayini Sivanesan** — Full-Stack Developer & Architect.
*   **Tisarindi Sanduka** — Scrum Master.
*   **Navodya De Silva** — Product Owner.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

***
**NIBM Canteen-Zero** — *Engineered for efficiency. Built for Scholars.*