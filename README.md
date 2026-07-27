# 🍽️ SmartDine — Michelin-Grade Digital Restaurant Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.12-indigo.svg)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

SmartDine is an enterprise-grade digital restaurant operating platform designed to deliver a calm, friction-free dining and kitchen management experience. Built as a unified monorepo, SmartDine bridges customer digital ordering, real-time Kitchen Display System (KDS) dispatching, interactive table reservations, printable GST tax invoicing, and fail-safe grounded AI insights.

---

## 🌟 Key Architecture & Highlights

- **Monorepo Architecture**: Integrated applications (`apps/customer-web`, `apps/staff-dashboard`, `server`, `shared`) linked by unified TypeScript data models.
- **Michelin-Grade Customer Web**: Dark obsidian visual aesthetic (`bg-stone-950`), sticky glass filter controls, high-resolution culinary photography, slide-over cart drawer, and live 5-stage kitchen ticket tracker.
- **High-Throughput Kitchen Display System (KDS)**: Chronological FIFO queue with 1-click status transitions (`Placed` -> `Preparing` -> `Ready` -> `Served` -> `Billed`).
- **Grounded AI Engine (Google Gemini 2.5 Flash)**:
  - **Chef Recommendations**: Grounded dish pairings (`⚡ 97% MATCH`) based on live kitchen inventory and meal periods.
  - **Operations Copilot**: Natural language query engine with database grounding and non-operational query refusal logic.
  - **Predictive Demand Forecasting**: Historical order velocity and peak-hour rush projections.
- **Fail-Safe Heuristic Fallbacks**: Operates seamlessly even if remote AI endpoints stall or reach API limits.
- **Production Hardening**: JWT access/refresh lifecycle, RBAC isolation, status regression prevention, and 0 TypeScript compilation errors.

---

## 📁 Repository Structure

```
d:\SMARTDINE\
├── apps/
│   ├── customer-web/      # Customer Self-Service Application (Next.js 14, Port 3000)
│   └── staff-dashboard/   # Kitchen KDS & Manager Analytics (Next.js 14, Port 3001)
├── server/                # Express / TypeScript Backend API (Port 4000)
├── shared/                # Common TypeScript Types & Utilities
├── prisma/                # PostgreSQL Database Schema & Migration Scripts
└── README.md              # Master System Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18.x` or `v20.x`
- npm `v9.x` or `v10.x`
- PostgreSQL (or local SQLite/Prisma development database)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/smartdine.git
cd smartdine

# Install all monorepo dependencies
npm install
```

### 2. Database Migration & Seed
```bash
# Generate Prisma Client & apply schema
npx prisma generate
npx prisma db push

# Seed sample menu items, tables, and staff accounts
npm run seed
```

### 3. Launch Development Servers
```bash
# Start backend, customer web, and staff dashboard concurrently
npm run dev
```

#### Access Application Ports:
- 📱 **Customer Web**: `http://localhost:3000`
- 👨‍🍳 **Staff & Kitchen Dashboard**: `http://localhost:3001`
- ⚙️ **Express API Backend**: `http://localhost:4000/api/v1`

---

## 🔒 Environment Configuration

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/smartdine"
JWT_SECRET="super-secret-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="super-secret-refresh-key-at-least-32-chars"
GEMINI_API_KEY="your-google-gemini-api-key"
```

---

## 🧪 Testing & Verification

```bash
# Verify zero compilation errors across all modules
npx tsc --noEmit (apps/customer-web)
npx tsc --noEmit (apps/staff-dashboard)
npx tsc --noEmit (server)
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
