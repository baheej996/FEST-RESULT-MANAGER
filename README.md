# FestResult OS — Modern Festival Result Management System

A complete, enterprise-grade web application for managing festival competitions, multi-judge score entry, result scrutiny, and publishing live championship leaderboards.

Engineered to replace traditional Google Sheets and Google Apps Script systems with an autonomous, high-performance database-driven system.

---

## ✨ Key Capabilities

- **Zero Google Dependencies**: Autonomous Next.js full-stack system backed by a robust relational database with Prisma ORM.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Super Administrator, Program Administrator, Judge / Operator, and Verification Officer.
- **Fast Keyboard Mark-Entry Grid**: Spreadsheet-like desktop data grid with `Enter`/`Tab`/`Arrow` navigation, instant client-side total/average calculation, and `Ctrl+S` autosave.
- **Scrutiny & Verification Workflow**: Multi-tier status state machine (`Draft` → `Submitted` → `Under Verification` → `Approved` → `Published`).
- **Deterministic Calculation Engine**: Configurable position points (1st/2nd/3rd), percentage-based grade thresholds (A/B/C), and festival tie-breaking policies.
- **Live Championship Leaderboard**: Dynamic overall institution rankings with visual podium (Gold, Silver, Bronze badges) updated atomically upon publication.
- **Mobile-Friendly Public Portal**: Searchable public results by student name, chest number, school, and event code.
- **Official Print Sheets & Excel Export**: Consolidated master records in Excel (.xlsx) and certified print layouts with seal and signature blocks.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & ORM**: SQLite / PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Salted Bcrypt + Jose JWT Sessions (HTTP-Only Secure Cookies)
- **Charts & Data**: Recharts, SheetJS (XLSX), PapaParse

---

## 🚀 Quick Start Guide

### 1. Install & Build
```bash
# Install dependencies
npm install

# Push Prisma schema to local database
npx prisma generate
npx prisma db push

# Seed realistic festival dataset (Sahodaya Kalotsav 2026)
node prisma/seed.js

# Build production bundle
npm run build
```

### 2. Start Application
```bash
# Start production server on port 3000
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Accounts (Demo / Testing)

| Role | Username / Email | Password |
|---|---|---|
| **Super Administrator** | `admin@festival.org` (or `superadmin`) | `admin123` |
| **Program Administrator** | `program@festival.org` (or `progadmin`) | `program123` |
| **Judge / Operator** | `judge@festival.org` (or `judge01`) | `judge123` |
| **Verification Officer** | `verifier@festival.org` (or `verifier01`) | `verifier123` |

*Note: The login page includes a convenient One-Click Role Switcher for instant testing.*

---

## 📚 Documentation Reference

- [Database Structure Specification](docs/DATABASE_STRUCTURE.md)
- [Calculation Engine & Business Logic](docs/BUSINESS_LOGIC.md)
- [Feature Mapping Matrix](docs/FEATURE_MAPPING.md)
- [Architecture Plan & Evaluation](docs/IMPLEMENTATION_PLAN.md)
- [Legacy System Audit Summary](docs/LEGACY_SYSTEM_AUDIT.md)
- [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [User & Operator Manual](docs/USER_GUIDE.md)

---

## 🧪 Running Verification Tests

Run the built-in test suite to verify math determinism, ranking algorithms, tie-breaking, and points tallying:
```bash
node scripts/test-engine.js
```

