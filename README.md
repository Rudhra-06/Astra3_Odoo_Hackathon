# Astra3_Odoo_Hackathon

# Odoo Hackathon 2026

Hi there! 👋

Welcome to our Odoo Hackathon 2026 repository.

# 🚀 AssetFlow - Enterprise Asset & Resource Management System

<div align="center">

### 📦 Centralize • Manage • Track • Optimize

**An Enterprise Asset & Resource Management Platform built for the Odoo Hackathon 2026**

---

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-000000?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)

</div>

---

# 📖 Overview

AssetFlow is a modern Enterprise Asset & Resource Management System that helps organizations efficiently manage, allocate, track, maintain, and audit their physical assets from a centralized platform.

Many organizations still rely on spreadsheets or disconnected systems for managing enterprise assets, leading to:

- ❌ Duplicate allocations
- ❌ Asset loss
- ❌ Poor maintenance tracking
- ❌ Booking conflicts
- ❌ Lack of accountability
- ❌ Difficult audits

AssetFlow solves these challenges through an integrated ERP-inspired solution featuring secure authentication, role-based access, asset lifecycle management, QR-enabled asset tracking, maintenance workflows, booking management, audit trails, and enterprise reporting.

---

# 🎯 Problem Statement

Organizations manage hundreds or even thousands of assets including:

- 💻 Laptops
- 🖥️ Monitors
- 📽️ Projectors
- 🚗 Company Vehicles
- 🪑 Furniture
- 📷 Cameras
- 🏢 Meeting Rooms
- 🖨️ Printers
- 🖥️ Servers

Traditional tracking methods become difficult to scale, resulting in inefficient resource utilization and operational delays.

AssetFlow provides a centralized digital platform that ensures complete visibility, accountability, and operational efficiency.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- Secure JWT Authentication
- Password Hashing (bcrypt)
- Session Persistence
- Token Expiry Handling
- Protected Routes
- Role-Based Authorization
- Automatic Session Restoration

---

## 👥 User Roles

- 👑 Administrator
- 📦 Asset Manager
- 🏢 Department Head
- 👤 Employee

Each role has customized permissions and navigation.

---

## 📦 Asset Management

- Register Assets
- Edit Assets
- Asset Categories
- Department Mapping
- Asset Search
- Asset Filtering
- Asset Status Tracking
- Asset Lifecycle Management
- Asset History

---

## 🔄 Asset Allocation

- Allocate Assets
- Return Assets
- Prevent Duplicate Allocation
- Allocation History
- Transfer Workflow
- Ownership Tracking

---

## 📱 QR Code Management

Every registered asset automatically receives:

- Unique Asset Tag
- QR Code Generation
- QR Download
- QR Regeneration
- QR Lookup

---

## 📅 Resource Booking

Reserve shared organizational resources including:

- Meeting Rooms
- Vehicles
- Projectors
- Shared Equipment

Features:

- Conflict Detection
- Booking Approval
- Booking History

---

## 🔧 Maintenance Management

Track:

- Maintenance Requests
- Service History
- Asset Health
- Maintenance Status
- Maintenance Schedule

---

## 📋 Audit Management

Perform organization-wide asset audits.

Supports:

- Verified Assets
- Missing Assets
- Damaged Assets
- Audit Cycles
- Audit History

---

## 🔔 Notification System

Receive notifications for:

- Asset Allocation
- Asset Returns
- Transfer Requests
- Booking Updates
- Maintenance Events
- Audit Activities

---

## 📊 Dashboard & Reports

Interactive Dashboard displaying:

- Total Assets
- Available Assets
- Allocated Assets
- Assets Under Maintenance
- Recent Activities
- Booking Overview
- Department Statistics

---

# 🏗️ System Architecture

```
                React Frontend
                      │
                Shared API Layer
                      │
               Express REST API
                      │
                Route Handlers
                      │
                 Controllers
                      │
                  Services
                      │
                Repositories
                      │
                 Prisma ORM
                      │
                 PostgreSQL
```

---

# 🗂️ Project Structure

```
AssetFlow
│
├── frontend
│   ├── components
│   ├── context
│   ├── pages
│   ├── hooks
│   ├── utils
│   └── assets
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── repositories
│   ├── routes
│   ├── services
│   ├── prisma
│   ├── utils
│   └── tests
│
└── README.md
```

---

# 🗄️ Database Design

The application uses a normalized PostgreSQL database designed with Prisma ORM.

### Core Entities

- Users
- Departments
- Asset Categories
- Assets
- Allocations
- Transfer Requests
- Vendors
- Bookings
- Maintenance Records
- Audit Cycles
- Notifications

The relational schema ensures data consistency while maintaining scalability for enterprise deployments.

---

# 🔄 Asset Lifecycle

```
Available
      │
Allocated
      │
Maintenance
      │
Returned
      │
Retired
      │
Disposed
```

The lifecycle prevents invalid transitions and maintains complete asset history.

---

# 🔒 Security Features

- JWT Authentication
- bcrypt Password Encryption
- Role-Based Access Control
- Protected APIs
- Secure Session Handling
- Authorization Middleware
- Input Validation
- Graceful Error Handling

---

# 💡 Technical Highlights

- Enterprise Layered Architecture
- Repository Pattern
- Service Layer
- Modular Components
- Clean REST APIs
- Prisma ORM
- PostgreSQL Database
- QR Code Integration
- Role-Based UI
- Production-Ready Authentication
- Session Persistence
- Conflict Detection Logic
- Modular Backend Design

---

# 🛠️ Tech Stack

## Frontend

- React
- React Router
- Tailwind CSS
- JavaScript

## Backend

- Node.js
- Express.js
- Prisma ORM

## Database

- PostgreSQL

## Authentication

- JWT
- bcrypt

## Additional Libraries

- QR Code Generator
- UUID
- Prisma Client

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-repository/AssetFlow.git
```

---

## Backend Setup

```bash
cd backend

npm install

npx prisma migrate dev

npx prisma db seed

npm start
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

# 👨‍💻 Demo Credentials

| Role | Email | Password |
|-------|--------|----------|
| Administrator | admin@assetflow.com | Password@123 |
| Asset Manager | manager@assetflow.com | Password@123 |
| Department Head | vikram@assetflow.com | Password@123 |
| Employee | raj@assetflow.com | Password@123 |

---

# 📈 Project Highlights

✅ Enterprise-grade architecture

✅ Secure authentication & authorization

✅ QR-enabled asset tracking

✅ Asset allocation workflow

✅ Resource booking system

✅ Maintenance management

✅ Audit management

✅ Notification system

✅ Production-ready database design

✅ Modular backend architecture

---

# 🌟 Future Enhancements

- AI-powered Asset Assistant
- Predictive Maintenance
- OCR-based Invoice Processing
- QR Scanner Integration
- Executive Analytics Dashboard
- AI-generated Reports
- Mobile Application
- Email & SMS Notifications

---

# 👥 Team Astra3

Developed for **Odoo Hackathon 2026**

### Team Members

- **Rudhrashini M S**
- **Namisha D**
- **Sri Divya Dharshini V S**

---

# 📄 License

This project was developed for educational and hackathon purposes.

---

<div align="center">

## ⭐ AssetFlow

### Transforming Enterprise Asset Management with Efficiency, Visibility, and Accountability.

Made with ❤️ for the Odoo Hackathon 2026

</div>
