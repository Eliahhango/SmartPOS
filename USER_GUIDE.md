# SmartPOS — User Guide

SmartPOS is a web-based Point-of-Sale and Inventory Management system for supermarkets, retail stores, and small-to-medium businesses. It runs in any modern browser on desktop, tablet, or mobile.

**Live system:** `https://smart-pos-plum.vercel.app`  
**Tech support:** Contact your system administrator

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Users & Roles](#3-users--roles)
4. [Products](#4-products)
5. [Categories](#5-categories)
6. [Suppliers](#6-suppliers)
7. [Customers](#7-customers)
8. [Tax Rates](#8-tax-rates)
9. [Branches](#9-branches)
10. [Point of Sale (POS)](#10-point-of-sale-pos)
11. [Inventory Management](#11-inventory-management)
12. [Purchase Orders](#12-purchase-orders)
13. [Expenses](#13-expenses)
14. [Reports](#14-reports)
15. [User Management (Admin)](#15-user-management-admin)
16. [Mobile Usage](#16-mobile-usage)
17. [Frequently Asked Questions](#17-frequently-asked-questions)

---

## 1. Getting Started

### 1.1 Logging In

1. Open your browser and navigate to the SmartPOS URL.
2. Click **Sign In to Dashboard** or go directly to `/login`.
3. Enter your email and password.
4. Click **Sign In**.

> **Security note:** After 3 failed login attempts within 60 seconds, your account is temporarily locked. Wait one minute before retrying.

### 1.2 First-Time Login (Demo Credentials)

If you are setting up the system for the first time, use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@smartpos.com` | `admin123` |
| **Store Manager** | `manager@smartpos.com` | `manager123` |
| **Cashier** | `cashier@smartpos.com` | `cashier123` |
| **Stock Officer** | `stock@smartpos.com` | `stock123` |

Each role has different permissions and sees a different set of menu options.

### 1.3 Navigation

After logging in, the sidebar on the left shows all available modules. On mobile, the sidebar collapses into a hamburger menu (☰) at the top.

| Menu Item | Description |
|-----------|-------------|
| **Dashboard** | Key performance indicators and charts |
| **POS** | Point-of-Sale screen for processing sales |
| **Products** | Product catalog management |
| **Categories** | Product groupings |
| **Suppliers** | Vendor/supplier management |
| **Customers** | Customer profiles and loyalty |
| **Inventory** | Stock levels, movements, adjustments |
| **Purchases** | Purchase order workflow |
| **Expenses** | Operational expense tracking |
| **Reports** | Analytics and insights |
| **Branches** | (Admin) Store location management |
| **Tax Rates** | (Admin) Tax class configuration |
| **Users** | (Admin) User account management |

---

## 2. Dashboard Overview

The Dashboard is the first screen you see after logging in. It provides a real-time snapshot of your business.

### 2.1 Welcome Banner

The top banner shows:
- Time-based greeting ("Good morning / afternoon / evening")
- Monthly revenue and monthly order count

**Action buttons:**
- **+ New Sale** — Opens the POS screen
- **View Reports** — Opens the Reports analytics page

### 2.2 KPI Cards

Four metric cards showing:

| Card | What it tells you |
|------|-------------------|
| **Today's Revenue** | Total sales amount for today + transaction count |
| **Avg. Transaction** | Average value per transaction + today's tax collected |
| **Active Products** | Total products + low stock / out-of-stock alerts |
| **Customers** | Total customer count + products expiring soon |

Green arrows = positive trend. Amber arrows = needs attention.

### 2.3 Revenue Trend Chart

A 7-day area chart showing daily revenue. Hover over data points to see exact values.

### 2.4 Payment Breakdown

Donut chart showing payment method distribution (cash, mobile money, card, bank) over the last 30 days.

### 2.5 Top Products

Ranked list of best-selling products with quantity sold and revenue bars.

### 2.6 Recent Transactions

The last 8 completed sales with invoice numbers, cashier names, payment methods, and status.

---

## 3. Users & Roles

SmartPOS has four user roles with different permissions:

### 3.1 Role Capabilities

| Feature | Admin | Manager | Cashier | Stock Officer |
|---------|-------|---------|---------|---------------|
| POS (make sales) | ✅ | ✅ | ✅ | ❌ |
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| Products (view) | ✅ | ✅ | ❌ | ✅ |
| Products (create/edit) | ✅ | ✅ | ❌ | ❌ |
| Inventory | ✅ | ✅ | ❌ | ✅ |
| Purchases | ✅ | ✅ | ❌ | ✅ |
| Customers | ✅ | ✅ | ❌ | ❌ |
| Suppliers | ✅ | ✅ | ❌ | ❌ |
| Categories | ✅ | ✅ | ❌ | ❌ |
| Expenses | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Tax Rates | ✅ | ❌ | ❌ | ❌ |
| Branches | ✅ | ❌ | ❌ | ❌ |

### 3.2 Role Descriptions

- **Admin** — Full system control. Can manage users, branches, tax rates, and all business data.
- **Manager** — Operational control. Can view reports, manage inventory, products, purchases, suppliers, customers, and expenses. Cannot manage users or system settings.
- **Cashier** — Sales-focused. Can only access the POS screen to process customer transactions.
- **Stock Officer** — Inventory-focused. Can manage stock levels, adjustments, and receive purchase orders.

---

## 4. Products

The Products module manages your entire product catalog.

### 4.1 Product Fields

| Field | Description | Required |
|-------|-------------|----------|
| **Name** | Product display name | ✅ |
| **Barcode** | Unique barcode number (scannable at POS) | ❌ (but recommended) |
| **SKU** | Stock Keeping Unit (internal code) | ❌ |
| **Category** | Product grouping (from Categories) | ❌ |
| **Supplier** |  Default vendor (from Suppliers) | ❌ |
| **Cost Price** | Your purchase cost per unit | ✅ |
| **Selling Price** | Retail price to customers | ✅ |
| **Tax Class** | Applicable tax rate (from Tax Rates) | ❌ |
| **Unit** | Unit of measure (pcs, kg, ltr, box) | ✅ |
| **Stock Quantity** | Current inventory count | ✅ |
| **Minimum Stock** | Low-stock alert threshold | ✅ |
| **Expiry Date** | Product expiration (for perishables) | ❌ |

### 4.2 Adding a Product

1. Go to **Products** in the sidebar.
2. Click **+ Add Product**.
3. Fill in the required fields (marked with asterisks).
4. Click **Create**.

### 4.3 Editing a Product

1. Click the **Edit** (pencil) icon on any product row.
2. Modify the fields.
3. Click **Update**.

### 4.4 Discontinuing a Product

1. Click the **Trash** icon on any product row.
2. Confirm the discontinuation.
3. The product is marked as discontinued but remains in historical records.

### 4.5 Bulk Import

You can import products from an Excel file:
1. Click **Import**.
2. Select an `.xlsx` or `.xls` file.
3. The system imports all products from the spreadsheet.

### 4.6 Searching Products

Use the search bar to find products by name, barcode, or SKU. Results update as you type.

---

## 5. Categories

Categories group products for easier management and reporting.

### 5.1 Managing Categories

- **Add Category** — Click **+ Add Category**, enter name and optional description.
- **Edit Category** — Click the pencil icon on any category card.
- **Delete Category** — Click the trash icon. Categories with products cannot be deleted.

Each category card shows the number of products assigned to it.

---

## 6. Suppliers

Suppliers are the vendors you purchase products from.

### 6.1 Supplier Fields

| Field | Description |
|-------|-------------|
| **Name** | Supplier/business name |
| **Phone** | Contact phone number |
| **Email** | Contact email address |
| **Address** | Physical or postal address |
| **TIN Number** | Tax Identification Number |

### 6.2 Managing Suppliers

- **Add Supplier** — Click **+ Add Supplier** and fill in the form.
- **Edit Supplier** — Click the pencil icon on any supplier card.
- **Delete Supplier** — Click the trash icon.

---

## 7. Customers

Customer profiles help track loyalty points and purchase history.

### 7.1 Customer Fields

| Field | Description |
|-------|-------------|
| **Name** | Customer's full name |
| **Phone** | Contact phone number |
| **Email** | Email address |
| **Address** | Physical address |

Customers automatically earn **loyalty points** with each purchase.

### 7.2 Viewing Customer Details

Click on any customer card to see:
- Full profile information
- Purchase history
- Current loyalty points balance

### 7.3 Searching Customers

Use the search bar to find customers by name, phone, or email.

---

## 8. Tax Rates

Tax Rates define the sales tax/VAT applied to products. Only **Admins** can manage tax rates.

### 8.1 Tax Rate Fields

| Field | Description |
|-------|-------------|
| **Name** | Tax name (e.g., "Standard VAT", "Zero Rated") |
| **Rate %** | Percentage rate (e.g., 16, 5, 0) |
| **Active** | Toggle to enable/disable this tax rate |

When a tax rate is assigned to a product, the POS automatically calculates and includes the tax in the sale total.

---

## 9. Branches

Branches represent different store locations. Only **Admins** can manage branches.

### 9.1 Branch Fields

| Field | Description |
|-------|-------------|
| **Name** | Branch name |
| **Address** | Physical location |
| **Phone** | Branch contact number |
| **Main Branch** | Toggle to mark as the primary location |

Users, sales, purchases, and inventory movements can be assigned to a specific branch.

---

## 10. Point of Sale (POS)

The POS screen is where cashiers process customer transactions.

### 10.1 Accessing the POS

- Click **POS** in the sidebar, or
- Click **+ New Sale** on the Dashboard banner.

### 10.2 Adding Items to the Cart

**Method 1: Barcode Scanner**
1. Click the barcode input field.
2. Scan the product barcode.
3. The product is instantly added to the cart.

**Method 2: Search**
1. Type in the search field (product name, barcode, or SKU).
2. Results appear below as you type.
3. Click a product to add it to the cart.

**Method 3: Quick Add**
- Click the **+** button next to a product in the search results.

### 10.3 Managing the Cart

| Action | How |
|--------|-----|
| **Increase quantity** | Click the **+** button on a cart item |
| **Decrease quantity** | Click the **−** button (removes item at 0) |
| **Remove item** | Click the **Trash** icon |
| **Add discount** | Enter a discount amount (flat value) |
| **Clear cart** | Click **Cancel** (or start a new sale after completion) |

### 10.4 Processing Payment

1. Click **Charge** (or the total amount button).
2. The payment screen shows the **grand total** (subtotal + tax − discount).

**Split Payments** — You can split the total across multiple payment methods:
- Click **Add Payment** to add a new payment row.
- For each payment, select:
  - **Method:** Cash, Mobile Money, Card, or Bank
  - **Amount:** The amount paid using this method
  - **Amount Received** (for cash): The cash tendered
  - **Change Given** (for cash): Auto-calculated if amount received is entered
  - **Reference No.** (for card/bank): Transaction reference
- The payment bar at the top shows how much is still due.

3. Once fully paid (due = 0), click **Complete Sale**.

### 10.5 Receipt Printing

After completing a sale:
- Click **Print Receipt** to send to a thermal printer.
- Click **New Sale** to start the next transaction.

### 10.6 Suspended Sales

You can pause a sale and resume it later:
1. Click the **Pause** (⏸) icon.
2. The sale is saved as a draft.
3. To resume, click **Suspended** and select the draft sale.
4. Click **Resume** to continue from where you stopped.

### 10.7 Viewing Receipts

Previous receipts can be reprinted from the dashboard's Recent Transactions list.

---

## 11. Inventory Management

The Inventory module tracks stock levels and provides a complete audit trail of all stock movements.

### 11.1 Current Stock Tab

Shows all products with:
- Name and category
- Current stock quantity
- Minimum stock threshold
- Stock status indicator:
  - **Green (OK)** — Stock is above minimum
  - **Amber (Low)** — Stock is at or below minimum
  - **Red (Out)** — Stock is zero
- Expiry date

### 11.2 Filtering Stock

| Filter | Shows |
|--------|-------|
| **All Stock** | All products |
| **Low Stock Alert** | Products at or below minimum stock |
| **Out of Stock** | Products with zero inventory |
| **Expiring Soon** | Products nearing their expiry date |

### 11.3 Stock Adjustments

Use Stock Adjustments to manually change inventory levels (e.g., for damaged goods, found items, or cycle counts):

1. Click **Stock Adjustment**.
2. Select the **Product**.
3. Enter **Quantity** (positive to add stock, negative to remove stock).
4. Select **Reason** (Manual Adjustment, Damaged Goods, Expired Goods).
5. Add **Notes** (required).
6. Click **Submit**.

Every adjustment is recorded in the Stock Movements audit trail.

### 11.4 Stock Movements Tab

A chronological log of every stock-affecting event:
- **Date** — When the movement occurred
- **Product** — Which product was affected
- **Change** — Quantity change (green arrow up = increase, red arrow down = decrease)
- **Reason** — Sale, purchase, adjustment, damage, etc.
- **User** — Who performed the action
- **Notes** — Additional details

---

## 12. Purchase Orders

Purchase orders track incoming inventory from suppliers.

### 12.1 Purchase Order Workflow

```
Draft → Approved → Received
```

1. **Draft** — A purchase order is created but not yet approved.
2. **Approved** — Manager approves the order for fulfillment.
3. **Received** — Goods arrive and stock is updated.

### 12.2 Creating a Purchase Order

1. Go to **Purchases** and click **+ New Purchase**.
2. Select the **Supplier**.
3. Enter the **Invoice Number** (optional).
4. Select the **Date**.
5. Add line items:
   - Select a **Product**.
   - Enter **Quantity**.
   - Enter **Cost Price**.
   - Click **+ Add Item** for additional products.
6. Click **Create Order**.

### 12.3 Approving a Purchase Order

On the purchase card, click **Approve** to change status from draft to approved.

### 12.4 Receiving Goods

When the shipment arrives:
1. Click **Receive** on the approved purchase order.
2. The system automatically updates stock quantities for all items in the order.

### 12.5 Viewing Purchase Details

Click the **Eye** icon on any purchase card to see full order details.

### 12.6 Filtering Purchases

Use the search bar and status filter to find specific orders.

---

## 13. Expenses

Track operational expenses like rent, electricity, salaries, and supplies.

### 13.1 Expense Types

Available expense categories: Rent, Electricity, Internet, Transport, Salary, Maintenance, Supplies, Marketing, Other.

### 13.2 Adding an Expense

1. Go to **Expenses** and click **+ Add Expense**.
2. Select the **Expense Type**.
3. Enter the **Amount**.
4. Add a **Description** (optional).
5. Select the **Date**.
6. Click **Create**.

### 13.3 Expense List

The expense ledger shows date, type, description, amount, and action buttons. The total for all displayed expenses appears in the header.

---

## 14. Reports

The Reports module provides business analytics across four tabs.

### 14.1 Sales Tab

| Metric | Description |
|--------|-------------|
| **Total Sales** | Revenue for the selected period |
| **Transactions** | Number of transactions |
| **Items Sold** | Total quantity of items sold |
| **Avg. Transaction** | Average revenue per transaction |

**Period filter:** Daily, Weekly, Monthly, Annual.

**Sales Trend Chart:** A bar chart showing revenue over time.

### 14.2 Inventory Tab

| Metric | Description |
|--------|-------------|
| **Total Products** | All active products in the catalog |
| **Low Stock** | Products at or below minimum threshold |
| **Out of Stock** | Products with zero inventory |
| **Expiring Soon** | Products nearing expiry |

**Stock Distribution Chart:** A pie chart showing in-stock vs. low-stock vs. out-of-stock proportions.

### 14.3 Financial Tab

| Metric | Description |
|--------|-------------|
| **Revenue** | Total income from sales |
| **Expenses** | Total operational expenses |
| **Profit** | Revenue minus expenses |
| **Tax Collected** | Total tax collected from sales|

### 14.4 Cashier Tab

Shows performance metrics per cashier: total sales count and total amount processed.

---

## 15. User Management (Admin)

Only Administrators can access the Users module.

### 15.1 Creating a User

1. Go to **Users** and click **+ Add User**.
2. Fill in:
   - **Full Name**
   - **Email** (used for login)
   - **Phone** (optional)
   - **Password**
   - **Role** (Admin, Manager, Cashier, Stock Officer)
   - **Branch** (assign to a store location)
3. Click **Create**.

### 15.2 Editing a User

Click the **Edit** icon on any user row. You can update name, phone, role, and branch. Email changes are not allowed — create a new account if needed.

### 15.3 Suspending / Activating a User

Click the **suspend** (red) or **activate** (green) icon to toggle a user's access. Suspended users cannot log in.

---

## 16. Mobile Usage

SmartPOS is fully responsive and works on smartphones and tablets.

### 16.1 Mobile Navigation

- The sidebar collapses into a **hamburger menu** (☰) at the top of the screen.
- Tap the hamburger to open the navigation drawer.
- Tap outside the drawer or press the **X** to close it.

### 16.2 POS on Mobile

The POS screen adapts to smaller screens:
- Product search and barcode input are stacked vertically.
- The cart panel collapses to a compact view.
- Payment buttons are touch-friendly (44px minimum tap target).
- Receipts can still be viewed and printed.

### 16.3 Tables on Mobile

Data tables (Products, Inventory, Expenses) are horizontally scrollable on mobile. Swipe left/right to see all columns.

### 16.4 Pinch-to-Zoom

The system supports pinch-to-zoom for accessibility. You can zoom in on any page for better readability.

### 16.5 iOS Text Size

Input fields use 16px font size minimum to prevent automatic zoom on iOS Safari.

---

## 17. Frequently Asked Questions

### How do I reset my password?
Contact your system administrator. They can create a new password for your account. For demo accounts, use the default passwords listed in Section 1.2.

### Why can't I see certain menu items?
Your user role determines what you can access. See Section 3 for role capabilities. Contact your admin if you need different permissions.

### What happens if I close the browser during a sale?
The sale is not saved unless you click **Complete Sale**. However, you can use the **Pause** feature to save a sale as a draft and resume later.

### How do I handle a refund?
Contact your administrator. Refund processing is available through the sales records.

### Why am I getting "Invalid email or password"?
This error covers all login failures (wrong email, wrong password, suspended account, rate limiting). Wait 60 seconds if you've attempted multiple times, and verify your credentials.

### Can I export data?
Product data can be imported from Excel. For exports, contact your administrator who can access the database directly.

### The system feels slow. What should I do?
- Check your internet connection.
- Close other browser tabs.
- Clear your browser cache.
- If the issue persists, contact your system administrator.

### How do I print receipts?
After completing a sale in POS, click **Print Receipt**. The system uses your browser's print functionality. For thermal printer support, configure your system's default printer settings.

### Are my transactions secure?
Yes. All API calls use JWT bearer tokens (24-hour expiry). Security headers (CSP, HSTS, X-Frame-Options) are configured at the server level. Rate limiting prevents brute-force attacks. Passwords are hashed with bcrypt.
