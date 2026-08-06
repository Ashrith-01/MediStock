# MediStock — Medical Inventory Management Platform

Full-stack implementation covering **Milestone 1** (auth, DB schema, backend/frontend setup)
and **Milestone 2** (medicine inventory + supplier management + search & filtering).

- **Backend:** Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA
- **Frontend:** React 18 (Vite), React Router, Axios, Tailwind CSS, Context API
- **Database:** MySQL (local dev) / PostgreSQL (production) — H2 also wired for a zero-install quick start

---

## 1. Backend setup

```bash
cd backend
```

### Option A — fastest way to try it (no DB install required)

Runs on an in-memory H2 database.

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

### Option B — local development with MySQL

1. Make sure MySQL is running locally.
2. Set credentials via env vars (or edit `application-dev.properties` directly):

```bash
export DB_USERNAME=root
export DB_PASSWORD=your_password
  mvn spring-boot:run
```

The `dev` profile is active by default and will auto-create the `medistock` database and tables
(`spring.jpa.hibernate.ddl-auto=update`).

### Option C — production with PostgreSQL

```bash
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:postgresql://<host>:5432/medistock
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export JWT_SECRET=<a-long-random-secret>
mvn clean package
java -jar target/medistock-backend.jar
```

Backend runs on **http://localhost:8080** by default.

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev`, `prod`, or `test` | `dev` |
| `DB_USERNAME` / `DB_PASSWORD` | DB credentials | `root`/`root` (dev) |
| `JWT_SECRET` | Signing key for JWTs | dev fallback (change in prod!) |
| `JWT_EXPIRATION_MS` | Token lifetime in ms | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3000` |

---

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_BASE_URL at the backend
npm run dev
```

Frontend runs on **http://localhost:5173**.

---

## 3. Using the app

1. Go to `/register`, create an account (pick a role: Admin / Pharmacist / Staff).
2. You're logged in immediately (JWT stored in `localStorage`) and land on the Dashboard.
3. **Suppliers** page: add suppliers first (Admin/Pharmacist only can create/edit; Admin only can delete).
4. **Medicines** page: add medicines, optionally linking a category/supplier, set quantity,
   low-stock threshold, and expiry date. Search/filter by name, batch number, category,
   supplier, or stock status (In Stock / Low Stock / Out of Stock).
5. Dashboard cards summarize totals, low-stock count, out-of-stock count, suppliers count,
   and medicines expiring within 30 days — click a card to jump to a filtered view.

Role-based access (enforced both in the UI and on the backend via `@PreAuthorize`):

| Action | Staff | Pharmacist | Admin |
|---|:---:|:---:|:---:|
| View medicines/suppliers | ✅ | ✅ | ✅ |
| Create/update medicines & suppliers | ❌ | ✅ | ✅ |
| Delete suppliers/categories | ❌ | ❌ | ✅ |
| Delete medicines | ❌ | ✅ | ✅ |

---

## 4. API reference

Base URL: `http://localhost:8080/api`

### Auth
- `POST /auth/register` — `{ fullName, email, password, role }` → `{ token, userId, fullName, email, role }`
- `POST /auth/login` — `{ email, password }` → same shape

All other endpoints require header `Authorization: Bearer <token>`.

### Categories
- `GET /categories`
- `POST /categories` — `{ name, description }` (Admin/Pharmacist)
- `PUT /categories/{id}`
- `DELETE /categories/{id}` (Admin only)

### Suppliers
- `GET /suppliers?name=<search>`
- `GET /suppliers/{id}`
- `POST /suppliers` — `{ name, contactNumber, email, address }` (Admin/Pharmacist)
- `PUT /suppliers/{id}`
- `DELETE /suppliers/{id}` (Admin only)

### Medicines
- `GET /medicines?name=&batchNumber=&categoryId=&supplierId=&expiryBefore=&expiryAfter=&stockStatus=`
- `GET /medicines/{id}`
- `GET /medicines/low-stock`
- `GET /medicines/out-of-stock`
- `GET /medicines/expiring?days=30`
- `POST /medicines` — `{ name, batchNumber, categoryId, supplierId, quantity, lowStockThreshold, manufacturingDate, expiryDate, price }` (Admin/Pharmacist)
- `PUT /medicines/{id}`
- `DELETE /medicines/{id}` (Admin/Pharmacist)

---

## 5. What's implemented vs. what's next

**Done (Milestone 1 & 2):**
- JWT auth, registration/login, role-based access (Admin/Pharmacist/Staff)
- Medicine CRUD with category & supplier relations, batch tracking, stock status derivation
- Supplier CRUD with search
- Category CRUD
- Search & filtering (name, batch, category, supplier, expiry range, stock status)
- React frontend: auth pages, protected routes, dashboard, medicine & supplier management UIs

**Not yet implemented (Milestones 3 & 4 per the plan):**
- Expiry/low-stock notification delivery (email/SMS/push) — `nearExpiry`/`expired`/`stockStatus`
  flags are already returned by the API so a notification job can be built on top
- Analytics dashboard charts, PDF/Excel report export
- OAuth2 login, password reset, Docker/CI deployment config
