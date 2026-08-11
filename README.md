# 🏥 MediStock - Enterprise Medical Inventory Management System

**MediStock** is a robust, full-stack medical inventory and pharmacy management platform designed to streamline medicine tracking, monitor stock levels, manage suppliers, automate expiry & low-stock notifications, generate PDF reports, and maintain complete audit logs across healthcare facilities.

---

## ✨ Features

- 🔒 **Role-Based Security & Authentication:** JWT token authentication with granular permissions for `ADMIN`, `PHARMACIST`, and `STAFF`.
- 💊 **Comprehensive Medicine Directory:** Real-time tracking of medicine quantities, batch numbers, categories, unit prices, minimum thresholds, and expiry dates.
- ⚠️ **Stock & Expiry Alert System:** Automated background scheduler checks for low-stock thresholds and approaching medicine expiration dates.
- 📧 **Automated Email Notifications:** Instant email alerts for critical stock warnings via Spring Mail / SMTP integration.
- 📑 **PDF Report Generation:** Professional downloadable PDF reports for inventory status, stock movements, and expiry reports powered by LibrePDF/OpenPDF.
- 📦 **Supplier & Category Management:** Categorize pharmaceuticals into therapeutic classes and manage supplier contact profiles and contracts.
- 📜 **Complete Audit Trails & History:** Track every stock transaction (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`, `EXPIRED`) with exact timestamps and responsible users.
- 📊 **Interactive Analytics Dashboard:** Real-time data visualization using Recharts for stock breakdown, low-stock warnings, and historical usage trends.

---

## 🛠 Tech Stack

### **Backend**
- **Framework:** Spring Boot 3.3.2 (Java 21)
- **Security:** Spring Security with JSON Web Tokens (JWT)
- **Database / ORM:** PostgreSQL / Spring Data JPA & Hibernate
- **PDF Engine:** LibrePDF / OpenPDF (v1.3.39)
- **Mail Service:** Spring Boot Starter Mail (SMTP)
- **Build Tool:** Maven

### **Frontend**
- **Framework:** React 18 (Vite 7)
- **Routing:** React Router DOM v6
- **Styling:** TailwindCSS v3 + PostCSS
- **Data Visualization:** Recharts
- **HTTP Client:** Axios

---

## 🏗 System Architecture

```
                 +-----------------------------------+
                 |           React Frontend          |
                 |     (Vite + Tailwind + Axios)     |
                 +-----------------+-----------------+
                                   |
                             REST API / JWT
                                   |
                 +-----------------v-----------------+
                 |        Spring Boot Backend        |
                 |                                   |
                 |  +-----------------------------+  |
                 |  |      Security & Auth        |  |
                 |  +-----------------------------+  |
                 |  |   Controllers & Services    |  |
                 |  +-----------------------------+  |
                 |  |    Scheduled Alert Tasks    |  |
                 |  +-----------------------------+  |
                 +--------+---------------+----------+
                          |               |
               Spring Data JPA        Spring Mail
                          |               |
                 +--------v-------+  +----+----------+
                 | PostgreSQL DB  |  | SMTP Server   |
                 +----------------+  +---------------+
```

---

## 🔑 Role-Based Access Control (RBAC)

| Feature / Action             | ADMIN | PHARMACIST | STAFF |
| :--------------------------- | :---: | :--------: | :---: |
| View Medicines & Stock       |   ✅  |     ✅     |   ✅  |
| Update Stock Quantities      |   ✅  |     ✅     |   ❌  |
| Add / Edit / Delete Medicine |   ✅  |     ✅     |   ❌  |
| Manage Categories            |   ✅  |     ✅     |   ❌  |
| Manage Suppliers             |   ✅  |     ❌     |   ❌  |
| View Audit Logs              |   ✅  |     ❌     |   ❌  |
| Generate PDF Reports         |   ✅  |     ❌     |   ❌  |
| User Account Management      |   ✅  |     ❌     |   ❌  |

---

## 📂 Directory Structure

```
MediStock/
├── backend/                        # Spring Boot Application
│   ├── src/main/java/com/medistock/
│   │   ├── config/                 # Security & Application Configurations
│   │   ├── controller/             # REST Endpoints (Auth, Medicines, Suppliers, Reports, etc.)
│   │   ├── dto/                    # Request & Response Payload Models
│   │   ├── entity/                 # JPA Database Entities (User, Medicine, Supplier, StockLog, etc.)
│   │   ├── exception/              # Custom Global Exception Handling
│   │   ├── report/                 # PDF Generation Service Implementation
│   │   ├── repository/             # Spring Data Repositories
│   │   ├── scheduler/              # Automated Alert Schedulers (Cron Jobs)
│   │   ├── security/               # JWT Utilities & Authentication Filters
│   │   └── service/                # Core Business Logic Layer
│   └── src/main/resources/
│       ├── application.properties  # Base Configuration
│       ├── application-dev.properties # Local PostgreSQL Setup
│       └── application-prod.properties# Production Settings
│
└── frontend/                       # React Application
    ├── src/
    │   ├── api/                    # Axios Client Instance & Interceptors
    │   ├── components/             # Reusable UI Elements (Navbar, Modals, Tables)
    │   ├── context/                # Authentication & Theme State Context
    │   ├── pages/                  # Views (Dashboard, Medicines, Suppliers, Audit Logs, Reports)
    │   ├── services/               # API Service Calls
    │   ├── App.jsx                 # Routing Setup
    │   └── main.jsx                # Entrypoint
    ├── tailwind.config.js          # Tailwind Configuration
    └── vite.config.js              # Vite Build & Server Config
```

---

## ⚡ Prerequisites

Make sure you have the following installed on your machine:
- **JDK 21** or higher
- **Node.js** (v18.x or higher) & **npm**
- **PostgreSQL** (v14.x or higher)
- **Maven 3.8+** (or use bundled Maven wrapper)

---

## 🚀 Getting Started

### 1. Database Configuration

Create a PostgreSQL database named `medistock`:

```sql
CREATE DATABASE medistock;
```

Update your database credentials in `backend/src/main/resources/application-dev.properties` if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medistock
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

---

### 2. Backend Setup (Spring Boot)

Navigate to the `backend` directory:

```bash
cd backend
```

Build the project:

```bash
mvn clean install
```

Run the application:

```bash
mvn spring-boot:run
```

The Spring Boot backend will start on **http://localhost:8081**.

---

### 3. Frontend Setup (React + Vite)

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The React frontend will be available at **http://localhost:5173**.

---

## ⚙️ Environment Variables

### Backend (`application.properties` / Environment)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profile (`dev`, `prod`, `test`) |
| `SERVER_PORT` | `8081` | Port on which the Spring Boot application runs |
| `JWT_SECRET` | `medistock-super-secret-key...` | Secret key used to sign JWT tokens |
| `JWT_EXPIRATION_MS` | `86400000` (24 Hours) | JWT token expiration duration in milliseconds |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Allowed origins for CORS configuration |

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user account.
- `POST /api/auth/login` - Authenticate user & receive JWT token.

### Medicines (`/api/medicines`)
- `GET /api/medicines` - Fetch paginated/filtered list of medicines.
- `GET /api/medicines/{id}` - Fetch single medicine details.
- `POST /api/medicines` - Create a new medicine record.
- `PUT /api/medicines/{id}` - Update medicine details.
- `DELETE /api/medicines/{id}` - Remove medicine from inventory.
- `POST /api/medicines/{id}/stock` - Record stock movement (`IN`, `OUT`, `ADJUSTMENT`).

### Categories & Suppliers (`/api/categories`, `/api/suppliers`)
- `GET /api/categories` - List medicine categories.
- `POST /api/categories` - Create new category.
- `GET /api/suppliers` - List medicine suppliers.
- `POST /api/suppliers` - Add new supplier.

### Notifications & Reports (`/api/notifications`, `/api/reports`)
- `GET /api/notifications` - Fetch active low-stock & expiry alerts.
- `GET /api/reports/pdf` - Download PDF inventory summary report.

---

## ⏰ Reporting & Automation

MediStock features built-in background schedulers that execute automated checks:
- **Low-Stock Check:** Runs periodic scans to compare current stock levels against pre-set threshold values.
- **Expiry Monitor:** Flags items reaching expiration within configurable windows (e.g., 30/60 days).
- **Email Dispatcher:** Sends consolidated status reports to system administrators.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
