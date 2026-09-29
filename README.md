# Ecom Peers 🛒

A full-stack multi-vendor e-commerce marketplace platform built with **Next.js**, **NestJS**, **PostgreSQL**, **Prisma ORM**, **Redis**, and **RabbitMQ**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker (Recommended)](#quick-start-with-docker-recommended)
- [Manual Local Setup](#manual-local-setup)
  - [1. Start Infrastructure Services](#1-start-infrastructure-services)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
- [Service URLs & Default Ports](#service-urls--default-ports)
- [Available Scripts](#available-scripts)
- [API Endpoints Reference](#api-endpoints-reference)
  - [1. User & Authentication](#1-user--authentication-apiuser--17-endpoints)
  - [2. Products](#2-products-apiproducts--9-endpoints)
  - [3. Categories](#3-categories-apicategories--2-endpoints)
  - [4. Orders](#4-orders-apiorders--16-endpoints)
  - [5. Provider & Staff Operations](#5-provider--staff-operations-apiprovider--10-endpoints)
  - [6. Admin Management & Moderation](#6-admin-management--moderation-apiadmin--24-endpoints)
  - [7. System & Health](#7-system--health-api--1-endpoint)
- [Platform Roles & Workflows](#platform-roles--workflows)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Ecom Peers** is a comprehensive multi-vendor commerce platform that supports:
- **Customers**: Browse products, manage cart and wishlist, place orders, track shipments, and request returns/cancellations.
- **Store Providers**: Register business accounts, manage product catalogs, view orders, dispatch shipments, and manage store staff.
- **Provider Staff**: Handle day-to-day warehouse, shipment checkpoint logging, and return receipt processing.
- **Platform Admins**: Moderate products, review provider applications, oversee users, and manage platform categories.

---

## Architecture & Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router, React 19), [TailwindCSS](https://tailwindcss.com/), [Redux Toolkit](https://redux-toolkit.js.org/), [Chart.js](https://www.chartjs.org/), Lucide Icons.
- **Backend**: [NestJS](https://nestjs.com/) (TypeScript, Express), [Prisma ORM](https://www.prisma.io/), JWT & Cookie-based Authentication.
- **Database**: [PostgreSQL 17](https://www.postgresql.org/).
- **Caching**: [Redis](https://redis.io/).
- **Message Queue**: [RabbitMQ](https://www.rabbitmq.com/) (AMQP message broker for asynchronous processing).
- **Containerization**: [Docker & Docker Compose](https://www.docker.com/).

---

## Repository Structure

```bash
ecom-peers/
├── backend/                  # NestJS API application
│   ├── prisma/               # Prisma schema & migrations
│   ├── src/
│   │   ├── admin/            # Admin moderation & metrics
│   │   ├── categories/       # Category management
│   │   ├── order/            # Orders, fulfillment & returns
│   │   ├── prisma/           # Prisma service & client
│   │   ├── products/         # Product catalog & file uploads
│   │   ├── provider/         # Provider staff & shipments
│   │   ├── user/             # Auth, cart, wishlist, address
│   │   └── main.ts           # NestJS bootstrap (API prefix: /api)
│   ├── uploads/              # Uploaded media assets
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Next.js web application
│   ├── apis/                 # API client & endpoint bindings
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable UI components & charts
│   ├── hooks/                # Custom React hooks (cart, wishlist)
│   ├── redux/                # Redux store & state slices
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Multi-container local orchestration
└── README.md                 # Project documentation
```

---

## Prerequisites

Before running the project locally, ensure you have installed:
- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later
- **Docker & Docker Compose**: (Recommended for running PostgreSQL, Redis, and RabbitMQ)
- **Git**

---

## Quick Start with Docker (Recommended)

You can launch the entire stack (PostgreSQL, Redis, RabbitMQ, Backend, and Frontend) with a single command:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ecom-peers
   ```

2. **Configure environment files:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start all containers:**
   ```bash
   docker compose up --build
   ```

To stop containers, run:
```bash
docker compose down
```

---

## Manual Local Setup

If you prefer to run the Node.js applications directly on your host machine for development:

### 1. Start Infrastructure Services

Spin up only the database, cache, and message queue using Docker:

```bash
docker compose up -d postgres redis rabbitmq
```

> **Note:** PostgreSQL is exposed on port **`5433`** on your host to prevent conflicts with any local PostgreSQL instance running on `5432`.

---

### 2. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *Verify that `DATABASE_URL` points to `postgresql://postgres:postgres@localhost:5433/ecommerce`.*

4. **Run database migrations and generate Prisma Client:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the backend development server:**
   ```bash
   npm run dev
   ```
   The backend API will start on **`http://localhost:4000`** with all routes prefixed with **`/api`**.

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *Ensure `NEXT_PUBLIC_API_URL` is set to `http://localhost:4000/api`.*

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The Next.js storefront will be accessible at **`http://localhost:3000`**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5433/ecommerce` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `supersecretjwtkey_change_in_production` |
| `JWT_EXPIRES_IN`| Token expiration timeframe | `7d` |
| `RABBITMQ_URL` | AMQP connection string for RabbitMQ | `amqp://guest:guest@localhost:5672` |
| `REDIS_URL` | Redis cache connection string | `redis://localhost:6379` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID *(optional)* | `your-google-client-id.apps.googleusercontent.com` |
| `MAIL_FROM` | Outgoing email sender address | `noreply@example.com` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port (465 for SSL / 587 for TLS)| `465` |
| `MAIL_USER` | SMTP username | `your-email@example.com` |
| `MAIL_PASS` | SMTP application password | `your-app-password` |

### Frontend (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base API URL including `/api` prefix | `http://localhost:4000/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID for frontend button | `your-google-client-id.apps.googleusercontent.com` |

---

## Service URLs & Default Ports

| Service | Host Port | URL / Connection |
| :--- | :--- | :--- |
| **Frontend Web App** | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | `4000` | [http://localhost:4000/api](http://localhost:4000/api) |
| **RabbitMQ Management** | `15672` | [http://localhost:15672](http://localhost:15672) *(guest / guest)* |
| **RabbitMQ AMQP** | `5672` | `amqp://localhost:5672` |
| **PostgreSQL Database** | `5433` | `localhost:5433` (db: `ecommerce`) |
| **Redis Cache** | `6379` | `localhost:6379` |

---

## Available Scripts

### Backend (`/backend`)
- `npm run dev` / `npm run start:dev` — Start the NestJS app in watch mode.
- `npm run build` — Build the TypeScript application to `/dist`.
- `npm run start:prod` — Run the production build.
- `npx prisma studio` — Open Prisma Web UI to inspect/edit database tables.
- `npx prisma migrate dev` — Apply pending database migrations.
- `npm test` — Run unit and integration tests with Vitest.

### Frontend (`/frontend`)
- `npm run dev` — Start the Next.js development server with hot-reload.
- `npm run build` — Create an optimized production build.
- `npm run start` — Run the Next.js production server.
- `npm run lint` — Run ESLint code checks.

---

## API Endpoints Reference

All API endpoints are hosted on port `4000` under the global `/api` prefix:  
`http://localhost:4000/api`

Total endpoints: **79**

---

### 1. User & Authentication (`/api/user` — 17 Endpoints)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/register` | Register a new customer account | Public |
| `POST` | `/api/user/login` | Login user and issue HTTP-only `accessToken` cookie | Public |
| `POST` | `/api/user/google` | Sign in or register with Google OAuth ID token | Public |
| `POST` | `/api/user/logout` | Clear auth cookie and logout | Authenticated |
| `GET` | `/api/user/profile` | Retrieve logged-in user profile details | Authenticated |
| `PATCH` | `/api/user/profile` | Update profile information (e.g. name) | Authenticated |
| `POST` | `/api/user/become-provider` | Upgrade existing user account to store provider | Authenticated |
| `POST` | `/api/user/register/provider` | Direct provider account registration | Public |
| `GET` | `/api/user/cart` | Get current customer's shopping cart items | Authenticated |
| `POST` | `/api/user/cart/sync` | Sync local/guest cart items with database | Authenticated |
| `PATCH` | `/api/user/cart/item` | Update item quantity or delete from cart | Authenticated |
| `GET` | `/api/user/favorites` | List all saved wishlist/favorite products | Authenticated |
| `POST` | `/api/user/favorites/:productId` | Toggle product in/out of favorites | Authenticated |
| `GET` | `/api/user/addresses` | List all saved customer delivery addresses | Authenticated |
| `POST` | `/api/user/addresses` | Create a new delivery address | Authenticated |
| `PATCH` | `/api/user/addresses/:id` | Update an existing delivery address | Authenticated |
| `DELETE` | `/api/user/addresses/:id` | Remove a delivery address | Authenticated |

---

### 2. Products (`/api/products` — 9 Endpoints)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | List products (paginated, with search & category filters) | Public |
| `GET` | `/api/products/filter` | Filter products by pricing, ratings, and attributes | Public |
| `GET` | `/api/products/:id` | Get public product details by ID | Public |
| `GET` | `/api/products/my` | List products owned by the authenticated provider | Provider |
| `GET` | `/api/products/my/:id` | Get single product owned by the authenticated provider | Provider |
| `POST` | `/api/products` | Create product with image upload (`multipart/form-data`) | Provider Owner |
| `PATCH` | `/api/products/:id` | Update product details and/or upload replacement image | Provider Owner |
| `PATCH` | `/api/products/:id/publish` | Toggle product published / live status | Provider Owner |
| `DELETE` | `/api/products/:id` | Delete a product listing | Provider Owner |

---

### 3. Categories (`/api/categories` — 2 Endpoints)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | List all active product categories | Public |
| `POST` | `/api/categories` | Create a new category | Public / Admin |

---

### 4. Orders (`/api/orders` — 16 Endpoints)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Place a new customer order | Customer |
| `GET` | `/api/orders` | Retrieve authenticated customer's order history | Customer |
| `GET` | `/api/orders/:id` | Get customer order details | Customer |
| `PATCH` | `/api/orders/:id/cancel` | Cancel an order directly (when status is `PENDING`) | Customer |
| `POST` | `/api/orders/:id/request-cancel` | Request cancellation with cancellation reason | Customer |
| `POST` | `/api/orders/:id/request-return` | Request product return with return reason | Customer |
| `GET` | `/api/orders/:id/tracking` | View shipment tracking history & timeline checkpoints | Customer |
| `GET` | `/api/orders/provider/all` | List all orders assigned to current provider | Provider |
| `GET` | `/api/orders/provider` | List provider orders (paginated / filtered by status) | Provider |
| `GET` | `/api/orders/provider/:id` | Get provider order details by ID | Provider |
| `PATCH` | `/api/orders/provider/:id/status` | Provider accept or reject customer order | Provider Owner |
| `GET` | `/api/orders/admin/all` | Admin list all marketplace orders | Admin |
| `GET` | `/api/orders/admin` | Admin list orders (paginated / filtered) | Admin |
| `GET` | `/api/orders/admin/:id` | Admin inspect any order details | Admin |
| `PATCH` | `/api/orders/admin/:id/status` | Admin override order status | Admin |
| `DELETE` | `/api/orders/admin/:id` | Admin delete an order | Admin |

---

### 5. Provider & Staff Operations (`/api/provider` — 10 Endpoints)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/provider/staff` | List staff members assigned to the provider | Provider Owner |
| `POST` | `/api/provider/staff` | Create new staff account | Provider Owner |
| `PATCH` | `/api/provider/staff/:id` | Update staff member details | Provider Owner |
| `DELETE` | `/api/provider/staff/:id` | Remove staff member | Provider Owner |
| `POST` | `/api/provider/shipments/move` | Move an accepted order to the shipment department | Provider Owner |
| `GET` | `/api/provider/shipments` | List provider shipment batches and records | Provider / Staff |
| `GET` | `/api/provider/shipments/:id` | View shipment details and dispatch checkpoints | Provider / Staff |
| `POST` | `/api/provider/shipments/:id/logs` | Log tracking checkpoint checkpoint updates | Provider / Staff |
| `PATCH` | `/api/provider/orders/:id/approve-return` | Approve or reject customer return/cancellation | Provider Owner |
| `PATCH` | `/api/provider/orders/:id/process-return` | Process physically received returned items & refund | Provider / Staff |

---

### 6. Admin Management & Moderation (`/api/admin` — 24 Endpoints)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Admin login and authenticate | Public (Admin only) |
| `GET` | `/api/admin/stats` | Platform statistics (total users, providers, products, orders) | Admin |
| `GET` | `/api/admin/users` | List platform users with search, role, and status filters | Admin |
| `GET` | `/api/admin/users/:id` | Get user details and related records | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Activate or deactivate a user account | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Update user role (`USER`, `PROVIDER`, `ADMIN`) | Admin |
| `DELETE` | `/api/admin/users/:id` | Delete user account | Admin |
| `GET` | `/api/admin/providers` | List all providers with search and approval filters | Admin |
| `GET` | `/api/admin/providers/:id` | Get provider profile and catalog | Admin |
| `PATCH` | `/api/admin/providers/:id/status` | Update provider status | Admin |
| `PATCH` | `/api/admin/providers/:id/approve` | Approve seller provider application | Admin |
| `PATCH` | `/api/admin/providers/:id/reject` | Reject seller provider application | Admin |
| `DELETE` | `/api/admin/providers/:id` | Delete provider profile | Admin |
| `GET` | `/api/admin/products` | List all products for marketplace moderation | Admin |
| `GET` | `/api/admin/products/:id` | View product details | Admin |
| `PATCH` | `/api/admin/products/:id/approve` | Approve product for public store listing | Admin |
| `PATCH` | `/api/admin/products/:id/reject` | Reject/hide product from marketplace | Admin |
| `DELETE` | `/api/admin/products/:id` | Delete a product listing | Admin |
| `GET` | `/api/admin/categories` | List all categories with product counts | Admin |
| `GET` | `/api/admin/categories/:id` | Get single category details | Admin |
| `GET` | `/api/admin/categories/:id/products` | List products belonging to a category | Admin |
| `POST` | `/api/admin/categories` | Create a new category | Admin |
| `PATCH` | `/api/admin/categories/:id` | Update category details (name, slug) | Admin |
| `DELETE` | `/api/admin/categories/:id` | Delete category (verifies zero assigned products) | Admin |

---

### 7. System & Health (`/api` — 1 Endpoint)

| Method | Endpoint | Description | Access / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | Root endpoint / API health check | Public |

---

## Platform Roles & Workflows

1. **Customer Workflow**:
   - Register at `/register` or login at `/login`.
   - Browse products, add items to cart, configure delivery address, and place an order.
   - Request order cancellation (while pending) or return with reason from customer order history.

2. **Provider Workflow**:
   - Register as a provider or upgrade existing account via `/dashboard/user`.
   - Once approved by Admin, access `/dashboard/provider`.
   - Create products (with images), accept/reject customer orders, dispatch to shipment department, and invite staff.

3. **Provider Staff Workflow**:
   - Logged-in staff members can view provider shipments, add tracking checkpoint logs, and process returned parcels.

4. **Admin Workflow**:
   - Login at `/admin/login`.
   - Review pending provider registrations, approve or reject newly submitted products, and oversee system metrics.

---

## Troubleshooting

- **Port 5433 vs 5432 Conflict**:
  If you encounter database connection errors, verify that `DATABASE_URL` in `backend/.env` references port `5433` when connecting to the Docker PostgreSQL container from the host machine.
- **Prisma Client Desynchronization**:
  After altering `backend/prisma/schema.prisma` or running migrations, run `npx prisma generate` inside the `backend` folder.
- **CORS / Cookie Authentication Issues**:
  The backend expects requests with `credentials: true`. Verify that your frontend `.env` contains `NEXT_PUBLIC_API_URL=http://localhost:4000/api` and that `allowedOrigins` in `backend/src/main.ts` includes `http://localhost:3000`.

---

## License

This project is licensed under the MIT License.
