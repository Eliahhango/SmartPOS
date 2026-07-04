# AxPOS — Missing Features & Improvements

> Verified against improvements.pdf + codebase audit.
> **Legend:** `[PDF]` = from improvements.pdf | `[AUDIT]` = discovered during audit | `[PARTIAL]` = partially exists, needs completion

---

## TIER 0 — BLOCKERS (System Integrity) ✅

- [x] **[AUDIT]** Backend input validation — express-validator on all POST/PUT/PATCH routes
- [x] **[AUDIT]** Image upload file-type & size validation (multer)
- [x] **[AUDIT]** Password strength requirements (min length, complexity) on register/profile
- [x] **[AUDIT]** Environment variable validation at startup (fail-fast on missing JWT_SECRET, DATABASE_URL)
- [x] **[AUDIT]** Rate limiting on ALL API endpoints (general 200/15min, auth 50/15min, login 3/60s)
- [x] **[AUDIT]** Unit/integration tests — 30 tests (validation + health), Jest + Supertest
- [x] **[AUDIT]** CI/CD pipeline — GitHub Actions (test + build) + Railway deploy + Dependabot

---

## TIER 1 — CORE BUSINESS FEATURES

### 1. Inventory Management ✅

- [x] **[PDF]** Stock In — dedicated modal + `POST /api/inventory/stock-in` with batch support
- [x] **[PDF]** Stock Out — dedicated modal + `POST /api/inventory/stock-out` with reason + availability check
- [x] **[PDF]** Barcode Printing — JsBarcode labels, print button per product row
- [x] **[PDF]** Batch Numbers / Lot Tracking — `batchNumber` on Product + StockMovement models
- [x] **[PDF]** Low Stock Alerts — dashboard banner, inventory banner, POS post-sale warnings
- [x] **[PDF]** Automatic Reorder Levels — `reorderQuantity` field, `GET /api/inventory/reorder-suggestions` grouped by supplier

### 2. Barcode System ✅

- [x] **[PDF]** Barcode Generator — EAN-13 (with check digit) / CODE128, "Generate" button on product form
- [x] **[PDF]** Barcode Label Printing — print sticky labels from products page (JsBarcode)

### 3. Sales / POS

- [x] **[PDF]** Keyboard Shortcuts — F1-F6, F8-F9, Ctrl+Enter, Escape + help overlay in POS
- [x] **[PDF]** Split Bill — dedicated split mode with checkboxes, Bill 1 / Bill 2 flow
- [x] **[AUDIT]** Server-persisted Suspend/Resume — creates sale with status='suspended', resume fetches from server
- [x] **[AUDIT]** Loading/skeleton states — skeleton loaders, empty states on products, inventory, purchases, expenses
- [x] **[AUDIT]** Frontend pagination — full pagination bars (First/Prev/1..5/Next/Last) on all list pages

### 4. Customer Management ✅

- [x] **[PDF]** Customer Balance — `balance` field tracks debt (+), overpayments (-)
- [x] **[PDF]** Credit Sales — credit payment method in POS, credit limit check, balance auto-updated
- [x] **[PDF]** Birthday Rewards — auto 10% discount on birthday, 🎂 notification on receipt
- [x] **[PDF]** Loyalty Points Redemption — 100 pts = $1, redeem in POS, ⭐ notification
- [x] **[PARTIAL]** Loyalty Points — earn + redeem, complete loop

### 5. Supplier Module

- [x] **[PDF]** Outstanding Balances — `balance` field on Supplier, tracks owed/credit
- [x] **[PDF]** Supplier Payments — `SupplierPayment` model, payment modal on supplier cards

### 6. Employee / HR

- [x] **[PDF]** Attendance — clock-in/out, today's status, weekly summary, `/attendance` page
- [x] **[PDF]** Shift Management — CRUD shifts, assign users to dates, `/shifts` page
- [x] **[PDF]** Commission Tracking — commissionRate on User, calculated per sale, shown in rewards

### 7. Reports & Analytics

- [x] **[PDF]** Cash Flow Report — statement of cash inflows vs outflows with daily breakdown
- [x] **[PDF]** Dead Stock Report — products with zero movement in N days with valuation
- [x] **[PDF]** Customer Report — customer acquisition, spend tiers, retention
- [x] **[PDF]** Supplier Report — supplier performance, purchase volume
- [x] **[PDF]** Category Sales Dashboard — aggregated revenue by product category

### 8. Receipt Customization

- [x] **[PDF]** Company Logo — upload via Settings page, rendered on receipt header
- [x] **[PDF]** QR Code on Receipt — generated at bottom of receipt via qrserver API
- [x] **[PARTIAL]** Scannable Barcode on Receipt — product barcode shown as text on each line item

### 9. Payment Methods ✅

- [x] **[PDF]** Credit Payment — credit payment method in POS, auto-updates customer balance, credit limit enforced

### 10. Multi-user & Roles

- [x] **[PDF]** Accountant Role — read-only access to all financial data, reports, dashboard
- [x] **[PARTIAL]** Store Keeper role — `stock_officer` + `store_keeper` alias added throughout backend/sidebar

---

## TIER 2 — SECURITY & ACCOUNTABILITY ✅

- [x] **[PDF]** Full Audit Log — `AuditLog` model + `req.audit()` helper in auth middleware:
  - Login/logout tracked
  - Product create/update/delete tracked with before/after snapshots
  - Price changes tracked
  - Sales tracked
  - Inventory stock-in/out/adjustment tracked
  - Customer payments tracked
- [x] **[AUDIT]** Structured business event logging — not just HTTP access logs
- [x] **[AUDIT]** Rate limiting on all API endpoints (extend beyond login)
- [ ] **[AUDIT]** Backend TypeScript migration — current backend is plain JS with no type safety

---

## TIER 3 — DATA RESILIENCE

- [x] **[PDF]** Automatic Backup — JSON export + download, server-side backup files
- [ ] **[PDF]** Cloud Backup — upload backups to S3/Cloudflare R2
- [x] **[PDF]** Manual Backup — one-click "Create Backup" on /backup page
- [x] **[PDF]** Restore Functionality — restore from backup file with confirmation

---

## TIER 4 — OFFLINE & ADVANCED

- [ ] **[PDF]** Offline Mode — Service Worker, IndexedDB local store, sync queue for sales
- [ ] **[PDF]** PWA (Progressive Web App) — manifest, service worker, install prompt
- [ ] **[PDF]** Dark/Light Theme — theme toggle with persistence
- [ ] **[PDF]** Multi-language Support — i18n framework (next-intl / react-i18next)
- [ ] **[PDF]** Multi-currency Support — currency per branch or per transaction

---

## TIER 5 — VALUE-ADD FEATURES

- [ ] **[PDF]** Gift Cards — sell/redeem gift cards
- [ ] **[PDF]** Coupon System — discount codes with conditions
- [ ] **[PDF]** WhatsApp Receipt Sending — send receipt via WhatsApp API
- [ ] **[PDF]** SMS Notifications — order confirmations, low stock alerts via SMS
- [ ] **[PDF]** Email Receipts — send receipt PDF via email
- [ ] **[PDF]** Warehouse Management — multi-location stock tracking
- [ ] **[PDF]** Stock Transfers — move stock between branches/warehouses
- [ ] **[PDF]** Accounting Module — double-entry bookkeeping integration
- [ ] **[PDF]** Financial Statements — balance sheet, income statement, trial balance
- [ ] **[PDF]** QR Code Payments — scan-to-pay (M-Pesa, etc.)
- [ ] **[PDF]** Delivery Management — assign deliveries, track status

---

## LEGEND

| Prefix | Meaning |
|--------|---------|
| `[PDF]` | Identified in improvements.pdf as missing |
| `[AUDIT]` | Discovered during codebase audit (PDF missed it) |
| `[PARTIAL]` | Partially exists but incomplete |
