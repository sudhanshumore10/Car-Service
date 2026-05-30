# ?? CarService – Car Service Booking Management System

A full-stack web-based Car Service Booking Management System built using Spring Boot, React, TypeScript, and MySQL. The platform helps customers book vehicle services, service managers manage workshops and capacity, technicians handle work orders and estimates, and users track invoices, payments, feedback, and service progress in one connected system.

---

## ?? Overview

CarService is designed to simplify the end-to-end vehicle servicing process by connecting customers, service managers, technicians, and administrators through a centralized web application.

The application allows users to:

- Register and login based on role
- Manage customer profiles and vehicles
- Browse workshops and service catalogs
- Book vehicle service slots
- Configure workshop capacity and technician shifts
- Generate and manage work orders
- Add diagnosis notes, estimates, services, and parts
- Send estimates for customer approval
- Generate invoices and record payments
- Manage pickup and drop requests
- Submit feedback after service completion
- View dashboards and operational reports

The system follows a modular architecture with role-based navigation, backend validation, relational database design, and separate frontend and backend layers.

---

## ?? Project Objective

Vehicle service booking often involves manual coordination between customers, workshops, technicians, and billing teams.

CarService solves this problem by providing:

- Centralized Service Booking
- Real-Time Slot Availability
- Workshop Capacity Management
- Vehicle and Customer Management
- Work Order Lifecycle Tracking
- Estimate Approval Flow
- Parts and Inventory Usage
- Invoice and Payment Tracking
- Feedback and Reporting
- Role-Based Access for Admin, Manager, Technician, and Customer

---

# ?? Application Workflow

```text
User Registration/Login
          ¦
          ?
Role-Based Authentication
          ¦
          ?
Dashboard Based on Role
          ¦
 +--------+-------------------------------+
 ?        ?               ?               ?
Customer Manager       Technician       Admin
 ¦        ¦               ¦               ¦
 ?        ?               ?               ?
Book      Configure       View Work       Manage Users
Service   Workshop        Orders          and Settings
 ¦        ¦               ¦               ¦
 ?        ?               ?               ?
Slot      Capacity        Diagnosis       Audit / Reports
Check     Rules           and Estimate
 ¦        ¦               ¦
 ?        ?               ?
Booking Confirmation      Customer Approval
          ¦               ¦
          ?               ?
      Work Order      Approved Job Scope
          ¦               ¦
          ?               ?
      Invoice Generation and Payment
          ¦
          ?
      Feedback and Reports
```

---

# ?? Core Modules

| Module | Description |
|---|---|
| Authentication & Authorization | User login, registration, role-based routing, secured access |
| Customer Profile & Vehicles | Customer details, address, vehicle registration, vehicle documents |
| Workshop Management | Workshop details, address, operating hours, serviceable brands |
| Capacity Management | Service bays, technician shifts, blackout dates, slot capacity rules |
| Service Catalog | Services, packages, add-ons, pricing, discounts, taxes, active status |
| Booking Module | Slot search, booking creation, pickup/drop option, conflict checks |
| Work Order Module | Work order lifecycle, technician assignment, status tracking |
| Diagnosis & Estimate Module | Findings, checklist, estimate items, approval workflow |
| Parts & Inventory | Parts catalog, stock tracking, work order parts, invoice item sync |
| Invoice & Payment | Invoice generation, payment recording, paid/pending status, receipts |
| Pickup & Drop | Pickup/drop request tracking and manager visibility |
| Notifications | Booking, invoice, estimate, and feedback notification records |
| Feedback | Customer ratings, comments, tags, manager responses |
| Reports & Dashboard | Manager reports, revenue, capacity, status mix, productivity views |
| Admin & Audit | User administration, audit logs, system settings support |

---

# ?? User Roles

## Customer

Customers can:

- Register and login
- Manage profile details
- Add and manage vehicles
- Upload vehicle document information
- Browse workshops
- View available service slots
- Book services
- Track bookings
- View estimates for approval
- View invoices
- Record payments
- Submit feedback

---

## Service Manager

Service Managers can:

- Manage workshops
- Configure service bays
- Configure technician shifts
- Configure capacity rules
- Add blackout dates
- View bookings
- Assign and track workshop operations
- Manage service catalog data
- View technician roster
- Monitor feedback
- View reports and dashboards

---

## Technician

Technicians can:

- Login to technician workspace
- View assigned work orders
- Update work order status
- Add diagnosis notes and checklist details
- Add parts and services to estimates
- Send estimates for customer approval
- Convert approved estimates to job scope
- Track invoice and work order progress

---

## Administrator

Administrators can:

- Manage users
- View system-level data
- Review audit logs
- Monitor role-based access
- Manage settings and system configuration

---

# ? Features

## ?? Authentication

- User Registration
- Secure Login
- Role-Based Dashboard Access
- Customer, Manager, Technician, and Admin Roles
- Protected Frontend Routes
- Backend Role-Aware APIs

---

## ?? Customer & Vehicle Management

- Customer Profile Management
- Address Management
- Vehicle CRUD
- VIN and Plate Number Validation
- Vehicle Active/Inactive Status
- Vehicle Document Record Support
- Vehicle Service History

---

## ?? Workshop & Capacity Management

- Workshop Listing
- Workshop Add/Edit Support
- Operating Hours
- Serviceable Brand Configuration
- Service Bay Management
- Technician Shift Management
- Blackout Date Management
- Capacity Rules Per Time Slot
- Slot Availability Calculation

---

## ?? Service Catalog

- Service List
- Service Price and Duration
- Buffer Time Configuration
- Service Package Support
- Add-On Support
- Tax and Discount Extension Tables
- Active/Inactive Catalog Items
- Category and Tag Support

---

## ?? Booking System

- Select Vehicle
- Select Workshop
- Select Services
- Choose Date and Slot
- Pickup/Drop Selection
- Estimated Cost Preview
- Conflict Checks for Vehicle and Slot
- Booking Confirmation
- Booking Cancellation and Reschedule Support

---

## ?? Work Orders

- Auto Work Order Creation from Booking
- Work Order Status Lifecycle
- Technician Assignment
- Work Order Detail View
- Diagnosis and Findings
- Estimate Builder
- Customer Approval State
- Convert Estimate to Job
- Work Order Logs

### Work Order Lifecycle

```text
SCHEDULED ? RECEIVED ? DIAGNOSIS ? IN_SERVICE ? QA ? READY ? DELIVERED ? CLOSED
```

---

## ?? Parts & Inventory

- Parts Catalog
- SKU, Price, and Stock Tracking
- Search Parts by Name or SKU
- Add Parts to Work Order
- Backorder Flag
- Stock Reduction
- Invoice Item Synchronization

---

## ?? Invoices & Payments

- Invoice Generation from Work Order
- Invoice Line Items
- Pending, Partially Paid, and Paid Status
- Payment Methods: Cash, Card, UPI
- Payment Recording
- Receipt Information
- Print / Save Invoice as PDF
- Customer Invoice View

---

## ?? Pickup & Drop

- Pickup/Drop Request Records
- Request Type Support
- Scheduled Time
- Completed Time
- Status Tracking
- Pickup Fee Configuration

---

## ? Feedback

- Customer Feedback Submission
- Rating System
- Comments
- Feedback Tags
- Manager Response
- Feedback Analytics Support

---

## ?? Reports & Dashboard

- Manager Overview Dashboard
- Workshop Count
- Booking Count
- Active Work Orders
- Paid Revenue
- Work Order Status Mix
- Technician Productivity
- Revenue Summary
- Feedback Summary

---

# ??? Database Design

The application uses MySQL and includes relational tables such as:

### users

Stores login credentials, role, phone, status, and account creation data.

### customers

Stores customer profile information linked with user accounts.

### vehicles

Stores vehicle details such as make, model, year, VIN, plate number, and active status.

### workshops

Stores workshop name, address, manager, timings, and serviceable brands.

### technician

Stores technician details, specialization, phone, workshop mapping, and user link.

### bookings

Stores customer service bookings, selected vehicle, workshop, start time, end time, and status.

### work_orders

Stores booking-linked work orders, technician assignment, lifecycle status, estimate and approval data.

### services

Stores service catalog items, base price, duration, buffer time, and active status.

### parts

Stores inventory parts, SKU, price, and stock.

### invoices

Stores invoice totals, work order mapping, payment status, and creation time.

### payments

Stores payment records, method, amount, status, and paid timestamp.

### feedback

Stores rating, comments, manager response, tags, and feedback submission data.

### audit_logs

Stores audit information for important system actions.

---

# ??? Technology Stack

## Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- Maven
- REST APIs

---

## Frontend

- React
- TypeScript
- HTML5
- CSS3
- Bootstrap
- React Router
- Axios
- React Hot Toast

---

## Database

- MySQL 8

---

## Development Tools

- Git
- GitHub
- VS Code
- Spring Tool Suite / Eclipse
- Postman
- MySQL Workbench

---

# ?? Security Features

- Role-Based Access Control
- Protected API Endpoints
- Protected Frontend Routes
- Password Hashing Support
- Login Validation
- Unauthorized Access Handling
- Audit Log Support
- Active/Inactive User Status

---

# ?? Project Structure

```bash
Car-Service/
¦
+-- BE4/
¦   +-- src/
¦   ¦   +-- main/
¦   ¦       +-- java/
¦   ¦       ¦   +-- com/infy/carservice/
¦   ¦       ¦       +-- auth/
¦   ¦       ¦       +-- common/
¦   ¦       ¦       +-- customer/
¦   ¦       ¦       +-- feedback/
¦   ¦       ¦       +-- parts/
¦   ¦       ¦       +-- scheduling/
¦   ¦       ¦       +-- technician/
¦   ¦       ¦       +-- vehicle/
¦   ¦       ¦       +-- workshop/
¦   ¦       +-- resources/
¦   +-- pom.xml
¦   +-- mvnw.cmd
¦
+-- frontend/
¦   +-- public/
¦   +-- src/
¦   ¦   +-- assets/
¦   ¦   +-- components/
¦   ¦   +-- layouts/
¦   ¦   +-- pages/
¦   ¦   ¦   +-- Admin/
¦   ¦   ¦   +-- Auth/
¦   ¦   ¦   +-- Customer/
¦   ¦   ¦   +-- ServiceManager/
¦   ¦   ¦   +-- Technician/
¦   ¦   +-- routes/
¦   ¦   +-- services/
¦   ¦   +-- utils/
¦   +-- package.json
¦   +-- package-lock.json
¦
+-- .gitignore
+-- README.md
```

---

# ?? Installation

## Clone Repository

```bash
git clone https://github.com/sudhanshumore10/Car-Service.git
cd Car-Service
```

---

## Backend Setup

Go to backend folder:

```bash
cd BE4
```

Install/compile dependencies:

```bash
mvn clean install
```

Or using Maven wrapper on Windows:

```bash
mvnw.cmd clean install
```

Configure database inside:

```text
BE4/src/main/resources/application.properties
```

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/car_service_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

Or run from Spring Tool Suite / Eclipse using the main application class.

---

## Frontend Setup

Go to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm start
```

Frontend usually runs on:

```text
http://localhost:3000
```

Backend usually runs on:

```text
http://localhost:8765
```

---

# ??? Database Setup

1. Open MySQL Workbench or MySQL CLI.
2. Create/import the database script for `car_service_db`.
3. Confirm that required tables such as `users`, `customers`, `vehicles`, `workshops`, `bookings`, `work_orders`, `invoices`, and `payments` exist.
4. Start backend after database setup.

---

# ?? Sample Login Roles

Use the seeded users from the database script.

| Role | Example Email | Password |
|---|---|---|
| Admin | admin@mail.com | pass123 |
| Manager | manager1@mail.com | pass123 |
| Technician | tech1@mail.com | pass123 |
| Customer | cust1@mail.com | pass123 |

---

# ?? Important Notes

- MySQL must be running before starting the backend.
- The backend port and frontend API base URL should match.
- Do not push real database passwords or secret keys to GitHub.
- The `node_modules`, `build`, and `target` folders are intentionally ignored by Git.
- If the frontend cannot connect to backend, check the Axios base URL configuration.

---

# ????? Developer

**Sudhanshu More**

- GitHub: https://github.com/sudhanshumore10
- LinkedIn: Add Your LinkedIn Profile

---

# ?? License

Copyright © 2026 Sudhanshu More.

This project is developed as a personal academic and learning project. All rights are reserved by the developer. Unauthorized copying, redistribution, or commercial use of this project without permission is not allowed.
