# 🚗 CarService – Car Service Booking Management System

A full-stack web-based Car Service Booking Management System built using **Spring Boot, React, TypeScript, and MySQL**.

The platform enables customers to book vehicle services, service managers to manage workshops and capacity, technicians to handle work orders and estimates, and administrators to monitor system-wide operations through a centralized application.

---

# 📖 Overview

CarService is designed to simplify the complete vehicle servicing process by connecting customers, service managers, technicians, and administrators through a single integrated platform.

The application allows users to:

* Register and login based on role
* Manage customer profiles and vehicles
* Browse workshops and service catalogs
* Book vehicle service slots
* Configure workshop capacity and technician shifts
* Generate and manage work orders
* Add diagnosis notes, estimates, services, and parts
* Send estimates for customer approval
* Generate invoices and record payments
* Manage pickup and drop requests
* Submit feedback after service completion
* View dashboards and operational reports

The system follows a modular architecture with role-based navigation, backend validation, relational database design, and separate frontend and backend layers.

---

# 🎯 Project Objective

Vehicle service booking often involves manual coordination between customers, workshops, technicians, and billing teams.

CarService solves this problem by providing:

* Centralized Service Booking
* Real-Time Slot Availability
* Workshop Capacity Management
* Vehicle and Customer Management
* Work Order Lifecycle Tracking
* Estimate Approval Workflow
* Parts and Inventory Management
* Invoice and Payment Tracking
* Feedback and Reporting
* Role-Based Access Control

---

# 🔄 Application Workflow

```text
User Registration/Login
          │
          ▼
Role-Based Authentication
          │
          ▼
Dashboard Based on Role
          │
 ┌────────┬─────────┬──────────┬─────────┐
 ▼        ▼         ▼          ▼
Customer Manager Technician Admin
 │        │         │          │
 ▼        ▼         ▼          ▼
Book    Manage    Work       User &
Service Workshop  Orders     System Mgmt
 │        │         │
 ▼        ▼         ▼
Booking Capacity Diagnosis
 │      Rules      Estimate
 └────────┬─────────┘
          ▼
 Customer Approval
          │
          ▼
 Work Order Execution
          │
          ▼
 Invoice Generation
          │
          ▼
 Payment Processing
          │
          ▼
 Feedback & Reports
```

---

# 📋 Core Modules

| Module                         | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| Authentication & Authorization | User login, registration, role-based routing, secured access      |
| Customer Profile & Vehicles    | Customer details, addresses, vehicle records, document management |
| Workshop Management            | Workshop details, operating hours, serviceable brands             |
| Capacity Management            | Service bays, technician shifts, blackout dates, capacity rules   |
| Service Catalog                | Services, packages, pricing, discounts, taxes                     |
| Booking Module                 | Slot search, booking creation, pickup/drop requests               |
| Work Order Module              | Technician assignment, status tracking, lifecycle management      |
| Diagnosis & Estimate           | Diagnosis notes, estimates, customer approval workflow            |
| Parts & Inventory              | Parts catalog, stock tracking, invoice synchronization            |
| Invoice & Payment              | Invoice generation, payment tracking, receipts                    |
| Notifications                  | Booking, estimate, invoice, and feedback notifications            |
| Feedback Module                | Ratings, comments, manager responses                              |
| Reports & Dashboard            | Revenue, productivity, utilization, feedback analytics            |
| Admin & Audit                  | User administration, audit logs, system settings                  |

---

# 👥 User Roles

## Customer

Customers can:

* Register and login
* Manage profile details
* Add and manage vehicles
* Browse workshops
* View available service slots
* Book services
* Track bookings
* View estimates
* Approve job scope
* View invoices
* Make payments
* Submit feedback

---

## Service Manager

Service Managers can:

* Manage workshops
* Configure service bays
* Configure technician shifts
* Define capacity rules
* Manage blackout dates
* Monitor bookings
* Manage service catalog
* Track workshop operations
* View reports and dashboards

---

## Technician

Technicians can:

* View assigned work orders
* Update work order status
* Add diagnosis notes
* Create estimates
* Add parts and services
* Submit estimates for approval
* Convert approved estimates into jobs
* Track service progress

---

## Administrator

Administrators can:

* Manage users
* Monitor system activity
* Review audit logs
* Configure system settings
* Manage role-based access

---

# ✨ Features

## 🔐 Authentication & Authorization

* User Registration
* Secure Login
* Role-Based Dashboard Access
* Customer, Manager, Technician, and Admin Roles
* Protected Frontend Routes
* Secured Backend APIs

---

## 🚘 Customer & Vehicle Management

* Customer Profile Management
* Address Management
* Vehicle CRUD Operations
* VIN Validation
* Plate Number Validation
* Vehicle Document Records
* Service History Tracking

---

## 🏢 Workshop & Capacity Management

* Workshop Management
* Operating Hours Configuration
* Serviceable Brand Configuration
* Service Bay Management
* Technician Shift Scheduling
* Blackout Date Management
* Slot Availability Calculation

---

## 🛠️ Service Catalog

* Service Listings
* Service Pricing
* Service Duration Management
* Service Packages
* Add-On Services
* Discount Support
* Tax Configuration
* Active/Inactive Service Management

---

## 📅 Booking System

* Vehicle Selection
* Workshop Selection
* Service Selection
* Slot Booking
* Pickup & Drop Requests
* Cost Estimation
* Conflict Validation
* Booking Confirmation
* Rescheduling Support
* Booking Cancellation

---

## 📑 Work Order Management

* Auto Work Order Creation
* Technician Assignment
* Status Tracking
* Diagnosis Recording
* Estimate Creation
* Customer Approval Workflow
* Job Scope Conversion
* Work Order Logs

### Work Order Lifecycle

```text
SCHEDULED
    ↓
RECEIVED
    ↓
DIAGNOSIS
    ↓
IN_SERVICE
    ↓
QA
    ↓
READY
    ↓
DELIVERED
    ↓
CLOSED
```

---

## 📦 Parts & Inventory

* Parts Catalog
* SKU Tracking
* Inventory Management
* Work Order Parts Assignment
* Backorder Support
* Stock Updates
* Invoice Synchronization

---

## 💳 Invoices & Payments

* Invoice Generation
* Invoice Line Items
* Payment Tracking
* Multiple Payment Methods

  * Cash
  * Card
  * UPI
* Receipt Generation
* PDF Invoice Support

---

## 🚚 Pickup & Drop Management

* Pickup Requests
* Drop Requests
* Scheduling Support
* Status Tracking
* Pickup Fee Configuration

---

## ⭐ Feedback System

* Customer Ratings
* Customer Comments
* Feedback Tags
* Manager Responses
* Feedback Analytics

---

## 📊 Reports & Dashboards

* Workshop Overview
* Booking Statistics
* Active Work Orders
* Revenue Summary
* Productivity Reports
* Capacity Utilization
* Feedback Reports

---

# 🗄️ Database Design

The application uses MySQL and contains relational tables including:

### Core Entities

* Users
* Customers
* Vehicles
* Workshops
* Technicians
* Services
* Bookings
* Work Orders
* Parts
* Invoices
* Payments
* Feedback
* Audit Logs

These entities maintain relationships to support booking, servicing, billing, reporting, and administration workflows.

---

# 🛠️ Technology Stack

## Backend

* Java 21
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* Maven
* REST APIs

---

## Frontend

* React
* TypeScript
* HTML5
* CSS3
* Bootstrap
* React Router
* Axios
* React Hot Toast

---

## Database

* MySQL 8

---

## Development Tools

* Git
* GitHub
* VS Code
* Spring Tool Suite (STS)
* Eclipse
* Postman
* MySQL Workbench

---

# 🔒 Security Features

* Role-Based Access Control
* Protected API Endpoints
* Protected Frontend Routes
* Password Hashing
* Login Validation
* Unauthorized Access Handling
* Audit Logging
* User Status Management

---

# 📂 Project Structure

```bash
Car-Service/
│
├── BE4/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/sudhanshumore10/Car-Service.git
cd Car-Service
```

---

## Backend Setup

```bash
cd BE4
mvn clean install
```

Configure database inside:

```text
BE4/src/main/resources/application.properties
```

Run application:

```bash
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8765
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

# 🗃️ Database Setup

1. Create MySQL database.
2. Import schema and seed scripts.
3. Verify required tables are created.
4. Configure database credentials.
5. Start backend service.

---

# 📝 Important Notes

* MySQL must be running before starting the backend.
* Backend and frontend URLs must match configuration.
* Never push passwords or secrets to GitHub.
* `node_modules`, `target`, and build folders are excluded from version control.
* Verify Axios API base URL if frontend cannot connect to backend.

---

# 🏁 Key Highlights

✔ Multi-Role Architecture

✔ Real-Time Service Booking

✔ Workshop Capacity Management

✔ Work Order Lifecycle Tracking

✔ Estimate Approval Workflow

✔ Parts & Inventory Management

✔ Invoice & Payment Processing

✔ Pickup & Drop Tracking

✔ Feedback & Reporting System

✔ Full-Stack Spring Boot + React Architecture

---

# 👨‍💻 Developer

**Sudhanshu More**

* GitHub: https://github.com/sudhanshumore10

---

# 📄 License

This project was developed for educational and learning purposes.

Copyright © 2026 Sudhanshu More.
