# BioStor

**BioStor** is a multi-tenant e-commerce platform built for social-media sellers (Instagram, TikTok, WhatsApp) who sell via DMs. It gives every seller a complete, self-branded online store — a public storefront with a cart and checkout — plus a full back-office dashboard for managing orders, products, customers and analytics. The platform also ships an admin panel for the platform operator.

Everything runs locally out of the box: the API, the storefront, the seller dashboard, and the admin panel. A demo dataset is seeded on first start so you can explore every screen immediately.

---

## Features

### Seller dashboard (`/dashboard`)
- **Orders** — list, search, filter by status, change order status, add internal notes, view customer details
- **Products** — full CRUD, variant groups (size/color with extra price & stock), image upload, feature/unpublish, duplicate, search/sort/filter, low-stock awareness
- **Categories** — create, rename, reorder, deactivate
- **Customers** — directory with order history and lifetime spend per customer
- **Analytics** — KPIs (revenue, orders, AOV, conversion, customers), revenue & orders over time, best-selling products, status breakdown
- **Notifications** — new orders, order status changes, low stock, system alerts (with unread badge)
- **Settings** — store branding (name, logo, tagline, socials), theme colors, currency, delivery fee, accent styles
- **Subscription** — Free / Pro / Business plans with product & order limits, upgrade/cancel flow

### Public storefront (`/store/{slug}`)
- Fully themed storefront driven by the seller's branding (colors, logo, layout)
- Product catalog with categories, variant pickers, stock badges and sale pricing
- Cart (persisted locally) and a checkout flow with delivery details
- Order confirmation page after a successful purchase

### Auth
- Register (auto-creates a store), login, email verification, forgot/reset password
- JWT access + refresh tokens with automatic refresh, role-based access (`store_owner`, `super_admin`)

### Admin panel (`/admin`)
- Platform stats, user & store management (suspend), orders across all stores, plan & subscription management

---

## Technology stack

| Layer       | Technology |
|-------------|-----------|
| Backend     | Python 3.12, FastAPI, SQLAlchemy 2 (async), Alembic, Pydantic v2 |
| Database    | SQLite (dev, default) / PostgreSQL (production, `postgresql+asyncpg://`) |
| Auth        | JWT (python-jose), bcrypt (passlib) |
| Storage     | Local disk by default; S3 / Supabase storage supported via env |
| Frontend    | Next.js 14 (App Router), React 18, TypeScript |
| Styling     | Tailwind CSS, Framer Motion, Lucide icons |
| State/data  | Zustand, Axios, React Hook Form, Zod, date-fns |

---

## Project structure

```
biostor/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # API routes (auth, products, orders, analytics, admin, ...)
│   │   ├── core/             # config, database, security, deps, rate limiting
│   │   ├── models/           # SQLAlchemy models
│   │   ├── repositories/     # data-access layer
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/         # business logic
│   │   └── seed.py           # demo-data seeder
│   └── requirements.txt
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # routes: landing, (auth), (dashboard), (store), admin, api
│   │   ├── components/       # ui, layout, storefront, dashboard, admin
│   │   ├── lib/              # api client, auth helpers, utils
│   │   ├── store/            # Zustand stores (cart, auth)
│   │   └── types/            # TypeScript types
│   ├── public/demo/          # demo product images
│   └── package.json
└── README.md
```

---

## Getting started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** (tested with Node 20/24)
- **npm** (or pnpm/yarn)

### 1. Backend

```bash
cd backend

# create & activate a virtual environment
python -m venv venv
venv\Scripts\activate            # Windows
source venv/bin/activate         # macOS / Linux

# install dependencies
pip install -r requirements.txt

# run the API (starts on http://localhost:8000)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On first start the app creates the SQLite database (`backend/biostore.db`), applies migrations and seeds demo data automatically.

Interactive API docs are available at: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend

npm install

# development server -> http://localhost:3000
npm run dev

# production build
npm run build
npm start
```

> The frontend calls the API at `http://localhost:8000/api/v1` by default. To point it elsewhere, set `NEXT_PUBLIC_API_URL` before building.

---

## Database setup

- **Local development (default):** SQLite via `aiosqlite` — no setup needed. On startup the app automatically creates the schema (SQLAlchemy `create_all`) and seeds the demo data. The database file (`backend/biostore.db`) is gitignored.
- **Production:** set `DATABASE_URL` to a PostgreSQL async URL, e.g.

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/biostor
```

Alembic is included in `requirements.txt` for future migrations; the current schema is managed by the app's `create_all` on startup.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `biostor-change-me-in-production-...` | JWT signing key — **change in production** |
| `DATABASE_URL` | `sqlite+aiosqlite:///./biostore.db` | Async SQLAlchemy database URL |
| `DEBUG` | `True` | Enables detailed errors |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT access-token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | JWT refresh-token lifetime |
| `FRONTEND_URL` | `http://localhost:3000` | Used for email links |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` | *(unset)* | If unset, emails are logged to the console in dev |
| `STORAGE_PROVIDER` | `local` | `local`, `s3` or `supabase` |
| `UPLOAD_DIR` | `./uploads` | Local upload folder |
| `SUPABASE_URL` / `SUPABASE_KEY` / `SUPABASE_BUCKET` | *(unset)* | Supabase storage credentials |
| `S3_BUCKET` / `S3_REGION` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` | *(unset)* | S3 storage credentials |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@biostor.app` / `Admin@12345` | Super-admin account seeded on first run |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL of the backend API |

---

## Demo accounts

Seeded automatically on first backend start:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Store owner** | `adem@biostor.app` | `Demo@12345` | Seller dashboard — store **Adem's Boutique** (`/store/ademshop`), 10 products, 5 categories, sample orders & analytics |
| **Super admin** | `admin@biostor.app` | `Admin@12345` | Admin panel (`/admin`) with platform stats, users, stores, orders, plans & subscriptions |

> These are development-only credentials. Change `ADMIN_PASSWORD` (and the demo user) before deploying anywhere public.

---

## Notes & security

- The repository contains **no real secrets**: there is no `.env` file, and the only credentials present are the development/demo defaults above, which must be changed in production.
- Rate limiting is enabled by default on API and auth routes (see config).
- Real payment processing is intentionally not simulated; plan selection records the intent and is designed to hook into a provider (Stripe/Adyen) later.
