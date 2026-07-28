# 🍽️ SmartDine — Next-Gen Autonomous Restaurant Operating System

**Hackathon**: Vibeathon 6.0 (Vibecoding Hackathon — Final Project Submission)  
**Organization / Security Sponsor**: NXTGENSEC (Next Generation Security)  

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.12-indigo.svg)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black.svg)](https://smartdine-customer-gamma.vercel.app)
[![Deployment: Render](https://img.shields.io/badge/Deployment-Render-blue.svg)](https://smartdine-server.onrender.com/api/v1)

---

## 👥 Team Information & Roles

- **Team Name**: `HackZone`
- **Team Lead Name**: **Rohith P** (*Full-Stack Architect & Real-Time Systems Integration*)
- **Team Members & Responsibilities**:
  - 👨‍💻 **Rohith P** — Team Lead & Full-Stack Architect (Monorepo Setup, Real-Time Polling, Status Lifecycle, Production Hardening)
  - ⚙️ **Dilip Shekar K** — Backend & Database Engineer (Express Controllers, Prisma Schema, Grounded AI Context Engine)
  - 🎨 **Meghana L S** — Frontend & UI/UX Developer (Michelin Dark Obsidian Design System, Cart Drawer, Voice STT Interface)
  - 🧪 **Lavanya C** — QA & Operations Testing (Cross-System Consistency Audit, Inventory Auto-Depletion & Table Sync Validation)

---

## 🌐 Live Public Deployment Links

- 📱 **Customer Web App (Vercel)**: [https://smartdine-customer-gamma.vercel.app](https://smartdine-customer-gamma.vercel.app)
- 👨‍🍳 **Staff Admin Dashboard (Vercel)**: [https://smartdine-staff.vercel.app](https://smartdine-staff.vercel.app)
- ⚙️ **Backend Core API (Render)**: [https://smartdine-server.onrender.com/api/v1](https://smartdine-server.onrender.com/api/v1)
- 📦 **Public GitHub Repository**: [https://github.com/Rohith-droid480/smartdine.git](https://github.com/Rohith-droid480/smartdine.git)

---

## 🔑 Pre-Seeded Demo Credentials

To experience the system during evaluation, use these pre-seeded accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@smartdine.com` | `Password123` | Digital Menu, Cart Checkout, Voice AI Concierge, Order Tracking, Table Booking |
| **Kitchen Staff** | `staff@smartdine.com` | `Password123` | KDS Dispatch Queue, Order Status Progression (`Placed` $\rightarrow$ `Billed`) |
| **Admin / Manager** | `admin@smartdine.com` | `Password123` | Executive KPI Metrics, Floorplan Seating, Inventory Audit, AI Operations Copilot |

---

## 🌟 Core System Features & Status

| Feature Module | Description & Capabilities | Status |
| :--- | :--- | :---: |
| **1-Second Real-Time KDS Sync** | Customer orders populate on Staff Admin KDS within 1 second with Web Audio crescendo bell chime `#101`. | **PRODUCTION READY** |
| **Strict Order Status Lifecycle** | Enforces sequential progression: `Placed` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Served` $\rightarrow$ `Billed`. | **PRODUCTION READY** |
| **Real Inventory Auto-Depletion** | Placing orders auto-deducts ingredient stock in PostgreSQL; zero stock auto-flips dish to **SOLD OUT**. | **PRODUCTION READY** |
| **Table Seating Sync** | Dine-in orders set table status `FREE` $\rightarrow$ `OCCUPIED`; billing completion returns table to `FREE`. | **PRODUCTION READY** |
| **Web Speech API Voice STT** | 🎙️ Zero-latency voice-to-text audio input with live transcript preview for hands-free ordering. | **PRODUCTION READY** |
| **Grounded Gemini AI Engine** | Injects live database revenue, active kitchen queue size, and ingredient stock into AI prompts. | **PRODUCTION READY** |
| **Double-Submit & Overlap Guard** | Disables checkout on submit; blocks overlapping table reservations with `HTTP 409 Conflict`. | **PRODUCTION READY** |
| **Evaluation Rate Limiter** | Active rate limiters (api: 600/min, ai: 60/min, auth: 60/min) tuned for multi-tab evaluation without 429 errors. | **PRODUCTION READY** |
| **POS Thermal Printer Integration** | Direct USB / Network ESC/POS hardware receipt printer driver. | **`[BETA]`** |
| **PWA Native Lockscreen Push** | Service Worker push notifications for customer order ready alerts when app is closed. | **`[BETA]`** |
| **Multi-Location Chain Analytics** | Cross-branch franchise telemetry and central supply-chain reordering dashboard. | **`[BETA]`** |

---

## 📁 Repository Structure

```
smartdine/
├── apps/
│   ├── customer-web/            # Customer Self-Service App (Next.js 14, Vercel)
│   └── staff-dashboard/         # Kitchen KDS & Executive Dashboard (Next.js 14, Vercel)
├── server/                      # Express Node.js Backend API (Render)
│   ├── prisma/                  # PostgreSQL Schema & Seed Scripts
│   └── src/                     # Controllers, Services, Middleware, Grounded AI Gateway
├── shared/                      # Monorepo Shared Contracts, Enums, & Utilities
└── README.md                    # Official Vibeathon 6.0 Submission README
```

---

## 🚀 Local Quick Start & Installation

### Prerequisites
- Node.js `v18.x` or `v20.x`
- npm `v9.x` or `v10.x`
- PostgreSQL (or Supabase Connection String)

### 1. Clone & Install
```bash
git clone https://github.com/Rohith-droid480/smartdine.git
cd smartdine
npm install
```

### 2. Database Migration & Seed
```bash
cd server
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Run Locally
```bash
# From root directory (starts all monorepo workspaces concurrently)
npm run dev
```

---

## 📄 License
This project is submitted for **Vibeathon 6.0** under the MIT License.
