# SmartPOS

Supermarket POS & Inventory Management System — web-based, single-branch MVP.

## How It Works

SmartPOS is a full-stack point-of-sale system with four user roles:

| Role | Access |
|------|--------|
| **Admin** | Full system control — users, branches, tax rates, all modules |
| **Manager** | Reports, inventory, purchases, products, suppliers, customers |
| **Cashier** | POS sales screen only — barcode scanning, cart, split payments, receipt printing |
| **Stock Officer** | Inventory management, stock adjustments, purchase receiving |

**Core flow:** Products are cataloged with barcodes, categories, suppliers, and tax classes. Cashiers process sales at the POS screen with support for split payments (cash, mobile money, card, bank). Every stock-affecting action (sale, purchase, adjustment, return, damage) writes to an audit trail. Purchases follow a draft → approve → receive workflow. Reports cover sales, inventory, financials, and cashier performance.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Recharts |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | SQLite (dev) / MySQL (prod) |
| Auth | JWT with role-based access control |

## Run Locally

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** (comes with Node.js)

### 1. Clone & install

```bash
git clone https://github.com/Eliahhango/SmartPOS.git
cd SmartPOS
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
node src/index.js
```

Backend runs on **http://localhost:5000**.

### 3. Frontend

Open a second terminal:

```bash
cd SmartPOS/frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**.

### 4. Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartpos.com` | `admin123` |
| Manager | `manager@smartpos.com` | `manager123` |
| Cashier | `cashier@smartpos.com` | `cashier123` |
| Stock Officer | `stock@smartpos.com` | `stock123` |

## Project Structure

```
SmartPOS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (16 tables)
│   │   └── seed.js          # Sample data
│   └── src/
│       ├── index.js          # Express server entry
│       ├── middleware/auth.js # JWT + RBAC middleware
│       └── routes/           # 14 API route files
└── frontend/
    └── src/
        ├── app/              # 14 pages (Next.js App Router)
        ├── components/       # Layout, sidebar
        └── lib/              # API client, auth context, utils
```
