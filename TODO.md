# AxPOS — Missing Features & Improvements

> Verified against improvements.pdf + codebase audit.
> **Legend:** `[PDF]` = from improvements.pdf | `[AUDIT]` = discovered during audit | `[PARTIAL]` = partially exists, needs completion

---

## TIER 0 — BLOCKERS (System Integrity)

- [ ] **[AUDIT]** Backend input validation — add express-validator/zod to all POST/PUT/PATCH routes
- [ ] **[AUDIT]** Image upload file-type & size validation (multer)
- [ ] **[AUDIT]** Password strength requirements (min length, complexity) on register/profile
- [ ] **[AUDIT]** Environment variable validation at startup (fail-fast on missing JWT_SECRET, DATABASE_URL, CORS origin)
- [ ] **[AUDIT]** Rate limiting on ALL API endpoints (currently login-only)
- [ ] **[AUDIT]** Unit/integration tests — zero tests exist anywhere
- [ ] **[AUDIT]** CI/CD pipeline (GitHub Actions or Railway CI)

---

## TIER 1 — CORE BUSINESS FEATURES

### 1. Inventory Management

- [ ] **[PDF]** Stock In — dedicated UI workflow to add stock to products
- [ ] **[PDF]** Stock Out — dedicated UI workflow to remove stock (with reason)
- [ ] **[PDF]** Barcode Printing — generate & print scannable barcode labels for products
- [ ] **[PDF]** Batch Numbers / Lot Tracking — add `batchNumber` field, track per-batch stock
- [ ] **[PDF]** Low Stock Alerts — push notification / in-app alert when stock ≤ minimumStock
- [ ] **[PDF]** Automatic Reorder Levels — generate suggested purchase orders when stock is low

### 2. Barcode System

- [ ] **[PDF]** Barcode Generator — auto-generate barcodes (EAN-13 / CODE128) for new products
- [ ] **[PDF]** Barcode Label Printing — print sticky labels from products page

### 3. Sales / POS

- [ ] **[PDF]** Keyboard Shortcuts — global hotkeys (F1-F12, numpad) for POS operations
- [ ] **[PDF]** Split Bill — divide cart items across separate bills (not just split payment)
- [ ] **[AUDIT]** Server-persisted Suspend/Resume — currently client-side only. POS must call `PUT /api/sales/:id/suspend`
- [ ] **[AUDIT]** Loading/skeleton states — all pages silently break on network error; no spinners
- [ ] **[AUDIT]** Frontend pagination — product/inventory/purchase/expense pages load ALL records, ignoring API pagination

### 4. Customer Management

- [ ] **[PDF]** Customer Balance — add `balance` field, track over payments / credit
- [ ] **[PDF]** Credit Sales — allow sales on credit, track outstanding customer debt
- [ ] **[PDF]** Birthday Rewards — add `birthday` field, auto-apply discount/reward on birthday
- [ ] **[PDF]** Loyalty Points Redemption — customers must be able to spend points (e.g., redeem for discount)
- [ ] **[PARTIAL]** Loyalty Points — earn exists, redeem does not (broken loop)

### 5. Supplier Module

- [ ] **[PDF]** Outstanding Balances — track what the business owes each supplier
- [ ] **[PDF]** Supplier Payments — record payments made to suppliers against purchases

### 6. Employee / HR

- [ ] **[PDF]** Attendance — clock-in / clock-out with timestamps
- [ ] **[PDF]** Shift Management — schedule shifts, assign cashiers to time blocks
- [ ] **[PDF]** Commission Tracking — per-sale or per-period commission calculation for cashiers

### 7. Reports & Analytics

- [ ] **[PDF]** Cash Flow Report — statement of cash inflows vs outflows (not just P&L)
- [ ] **[PDF]** Dead Stock Report — products with zero movement in N days
- [ ] **[PDF]** Customer Report — customer acquisition, spend tiers, retention
- [ ] **[PDF]** Supplier Report — supplier performance, purchase volume, lead times
- [ ] **[PDF]** Category Sales Dashboard — aggregated revenue by product category

### 8. Receipt Customization

- [ ] **[PDF]** Company Logo — upload & render logo image on receipt
- [ ] **[PDF]** QR Code on Receipt — generate QR linking to invoice or payment page
- [ ] **[PARTIAL]** Scannable Barcode on Receipt — currently plain text `[barcode]`, needs barcode image rendering

### 9. Payment Methods

- [ ] **[PDF]** Credit Payment — allow credit as a payment method (tracks debt to customer account)

### 10. Multi-user & Roles

- [ ] **[PDF]** Accountant Role — read-only access to reports, expenses, financials
- [ ] **[PARTIAL]** Store Keeper role — `stock_officer` exists but naming convention doesn't match PDF. Consider alias or rename.

---

## TIER 2 — SECURITY & ACCOUNTABILITY

- [ ] **[PDF]** Full Audit Log — model + middleware to track every business event:
  - Who logged in/out
  - Who created/edited/deleted products
  - Who changed prices
  - Who modified users/roles
  - Who processed refunds
  - Who deleted invoices
- [ ] **[AUDIT]** Structured business event logging — not just HTTP access logs
- [ ] **[AUDIT]** Rate limiting on all API endpoints (extend beyond login)
- [ ] **[AUDIT]** Backend TypeScript migration — current backend is plain JS with no type safety

---

## TIER 3 — DATA RESILIENCE

- [ ] **[PDF]** Automatic Backup — scheduled database backups (pg_dump / cron)
- [ ] **[PDF]** Cloud Backup — upload backups to S3/Cloudflare R2
- [ ] **[PDF]** Manual Backup — one-click export of DB + uploads
- [ ] **[PDF]** Restore Functionality — restore from backup file with validation

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
