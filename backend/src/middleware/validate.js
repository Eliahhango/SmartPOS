/**
 * express-validator validation chains for all API routes.
 * Each export is an array of validation rules + the error handler middleware.
 */
const { body, param, query, validationResult } = require('express-validator');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Throws 400 with first validation error message */
const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

/**
 * Password strength validator.
 * Requires: 8+ chars, uppercase, lowercase, digit, special character.
 * Skips validation if value is undefined (for optional password fields).
 */
const strongPassword = (field = 'password') =>
  body(field)
    .if((value) => value !== undefined)
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one digit')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/).withMessage('Password must contain at least one special character');

// ── Auth ─────────────────────────────────────────────────────────────────────

const login = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleErrors,
];

const register = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required (1-100 characters)'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  strongPassword('password'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('role').optional().isIn(['admin', 'manager', 'cashier', 'stock_officer']).withMessage('Invalid role'),
  body('branchId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid branch ID'),
  handleErrors,
];

const updateProfile = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  strongPassword('password').optional(),
  handleErrors,
];

// ── Products ─────────────────────────────────────────────────────────────────

const createProduct = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Product name is required (1-200 chars)'),
  body('barcode').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('Barcode too long (max 50)'),
  body('sku').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('SKU too long (max 50)'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be >= 0'),
  body('costPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Cost price must be >= 0'),
  body('categoryId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid category ID'),
  body('supplierId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid supplier ID'),
  body('taxClassId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid tax class ID'),
  body('unit').optional().isString().isLength({ max: 20 }).withMessage('Unit too long (max 20)'),
  body('stockQuantity').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Stock must be >= 0'),
  body('minimumStock').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Minimum stock must be >= 0'),
  body('reorderQuantity').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Reorder quantity must be >= 0'),
  body('batchNumber').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('Batch number too long (max 50)'),
  body('expiryDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid expiry date format'),
  body('status').optional().isIn(['active', 'discontinued']).withMessage('Status must be active or discontinued'),
  handleErrors,
];

const updateProduct = [
  body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Product name must be 1-200 chars'),
  body('barcode').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('Barcode too long (max 50)'),
  body('sku').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('SKU too long (max 50)'),
  body('sellingPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Selling price must be >= 0'),
  body('costPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Cost price must be >= 0'),
  body('categoryId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid category ID'),
  body('supplierId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid supplier ID'),
  body('taxClassId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid tax class ID'),
  body('unit').optional().isString().isLength({ max: 20 }).withMessage('Unit too long (max 20)'),
  body('stockQuantity').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Stock must be >= 0'),
  body('minimumStock').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Minimum stock must be >= 0'),
  body('reorderQuantity').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Reorder quantity must be >= 0'),
  body('batchNumber').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('Batch number too long (max 50)'),
  body('expiryDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid expiry date format'),
  body('status').optional().isIn(['active', 'discontinued']).withMessage('Status must be active or discontinued'),
  handleErrors,
];

const discontinueProduct = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
  handleErrors,
];

// ── Categories ───────────────────────────────────────────────────────────────

const createCategory = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name is required (1-100 chars)'),
  body('description').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Description too long (max 500)'),
  handleErrors,
];

const updateCategory = [
  param('id').isInt({ min: 1 }).withMessage('Invalid category ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Category name must be 1-100 chars'),
  body('description').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Description too long (max 500)'),
  handleErrors,
];

const deleteCategory = [
  param('id').isInt({ min: 1 }).withMessage('Invalid category ID'),
  handleErrors,
];

// ── Suppliers ────────────────────────────────────────────────────────────────

const createSupplier = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Supplier name is required (1-200 chars)'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('address').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Address too long (max 500)'),
  body('tinNumber').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('TIN too long (max 50)'),
  handleErrors,
];

const updateSupplier = [
  param('id').isInt({ min: 1 }).withMessage('Invalid supplier ID'),
  body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Supplier name must be 1-200 chars'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('address').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Address too long (max 500)'),
  body('tinNumber').optional({ values: 'falsy' }).isString().isLength({ max: 50 }).withMessage('TIN too long (max 50)'),
  handleErrors,
];

const deleteSupplier = [
  param('id').isInt({ min: 1 }).withMessage('Invalid supplier ID'),
  handleErrors,
];

// ── Customers ────────────────────────────────────────────────────────────────

const createCustomer = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Customer name is required (1-200 chars)'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('address').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Address too long (max 500)'),
  handleErrors,
];

const updateCustomer = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Customer name must be 1-200 chars'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('address').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Address too long (max 500)'),
  body('points').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Points must be >= 0'),
  body('creditLimit').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Credit limit must be >= 0'),
  body('birthday').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid birthday date format'),
  handleErrors,
];

// ── Sales ────────────────────────────────────────────────────────────────────

const createSale = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Each item must have a valid productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item must have quantity >= 1'),
  body('items.*.price').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Item price must be >= 0'),
  body('payments').isArray({ min: 1 }).withMessage('At least one payment is required'),
  body('payments.*.method').isIn(['cash', 'mobile_money', 'card', 'bank']).withMessage('Invalid payment method'),
  body('payments.*.amount').isFloat({ min: 0 }).withMessage('Payment amount must be >= 0'),
  body('payments.*.amountReceived').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Amount received must be >= 0'),
  body('payments.*.changeGiven').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Change must be >= 0'),
  body('payments.*.referenceNo').optional({ values: 'falsy' }).isString().isLength({ max: 100 }).withMessage('Reference too long (max 100)'),
  body('customerId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('discount').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Discount must be >= 0'),
  handleErrors,
];

const suspendSale = [
  param('id').isInt({ min: 1 }).withMessage('Invalid sale ID'),
  handleErrors,
];

const resumeSale = [
  param('id').isInt({ min: 1 }).withMessage('Invalid sale ID'),
  handleErrors,
];

const createReturn = [
  param('id').isInt({ min: 1 }).withMessage('Invalid sale ID'),
  body('items').isArray({ min: 1 }).withMessage('At least one return item is required'),
  body('items.*.saleItemId').isInt({ min: 1 }).withMessage('Invalid sale item ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Return quantity must be >= 1'),
  body('items.*.restocked').optional().isBoolean().withMessage('Restocked must be boolean'),
  body('refundMethod').isString().notEmpty().withMessage('Refund method is required'),
  body('reason').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Reason too long (max 500)'),
  handleErrors,
];

// ── Purchases ────────────────────────────────────────────────────────────────

const createPurchase = [
  body('supplierId').isInt({ min: 1 }).withMessage('Supplier ID is required'),
  body('invoiceNo').optional({ values: 'falsy' }).isString().isLength({ max: 100 }).withMessage('Invoice no too long (max 100)'),
  body('date').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date format'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Each item must have a valid productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item must have quantity >= 1'),
  body('items.*.costPrice').isFloat({ min: 0 }).withMessage('Each item must have costPrice >= 0'),
  handleErrors,
];

const approvePurchase = [
  param('id').isInt({ min: 1 }).withMessage('Invalid purchase ID'),
  handleErrors,
];

const receivePurchase = [
  param('id').isInt({ min: 1 }).withMessage('Invalid purchase ID'),
  handleErrors,
];

// ── Inventory ────────────────────────────────────────────────────────────────

const createAdjustment = [
  body('productId').isInt({ min: 1 }).withMessage('Product ID is required'),
  body('changeQty').isInt().withMessage('Change quantity is required (use negative for reductions)'),
  body('reason').isIn(['adjustment', 'damage', 'expiry']).withMessage('Reason must be adjustment, damage, or expiry'),
  body('notes').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Notes too long (max 500)'),
  handleErrors,
];

// ── Expenses ─────────────────────────────────────────────────────────────────

const createExpense = [
  body('expenseType').isIn(['Rent', 'Electricity', 'Internet', 'Transport', 'Salary', 'Maintenance', 'Supplies', 'Marketing', 'Other'])
    .withMessage('Invalid expense type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be > 0'),
  body('description').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Description too long (max 500)'),
  body('date').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date format'),
  body('branchId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid branch ID'),
  handleErrors,
];

const updateExpense = [
  param('id').isInt({ min: 1 }).withMessage('Invalid expense ID'),
  body('expenseType').optional().isIn(['Rent', 'Electricity', 'Internet', 'Transport', 'Salary', 'Maintenance', 'Supplies', 'Marketing', 'Other'])
    .withMessage('Invalid expense type'),
  body('amount').optional({ values: 'falsy' }).isFloat({ min: 0.01 }).withMessage('Amount must be > 0'),
  body('description').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Description too long (max 500)'),
  body('date').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date format'),
  body('branchId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid branch ID'),
  handleErrors,
];

const deleteExpense = [
  param('id').isInt({ min: 1 }).withMessage('Invalid expense ID'),
  handleErrors,
];

// ── Taxes ────────────────────────────────────────────────────────────────────

const createTax = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Tax name is required (1-100 chars)'),
  body('ratePercent').isFloat({ min: 0, max: 100 }).withMessage('Rate must be 0-100'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  handleErrors,
];

const updateTax = [
  param('id').isInt({ min: 1 }).withMessage('Invalid tax ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Tax name must be 1-100 chars'),
  body('ratePercent').optional().isFloat({ min: 0, max: 100 }).withMessage('Rate must be 0-100'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  handleErrors,
];

const deleteTax = [
  param('id').isInt({ min: 1 }).withMessage('Invalid tax ID'),
  handleErrors,
];

// ── Branches ─────────────────────────────────────────────────────────────────

const createBranch = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Branch name is required (1-200 chars)'),
  body('address').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Address too long (max 500)'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('isMainBranch').optional().isBoolean().withMessage('isMainBranch must be boolean'),
  handleErrors,
];

const updateBranch = [
  param('id').isInt({ min: 1 }).withMessage('Invalid branch ID'),
  body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Branch name must be 1-200 chars'),
  body('address').optional({ values: 'falsy' }).isString().isLength({ max: 500 }).withMessage('Address too long (max 500)'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('isMainBranch').optional().isBoolean().withMessage('isMainBranch must be boolean'),
  handleErrors,
];

// ── Users ────────────────────────────────────────────────────────────────────

const updateUser = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 chars'),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }).withMessage('Phone too long (max 20)'),
  body('role').optional().isIn(['admin', 'manager', 'cashier', 'stock_officer']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'suspended']).withMessage('Status must be active or suspended'),
  body('branchId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid branch ID'),
  strongPassword('password').optional(),
  handleErrors,
];

const suspendUser = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
  handleErrors,
];

const activateUser = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
  handleErrors,
];

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  // Auth
  login,
  register,
  updateProfile,
  // Products
  createProduct,
  updateProduct,
  discontinueProduct,
  // Categories
  createCategory,
  updateCategory,
  deleteCategory,
  // Suppliers
  createSupplier,
  updateSupplier,
  deleteSupplier,
  // Customers
  createCustomer,
  updateCustomer,
  // Sales
  createSale,
  suspendSale,
  resumeSale,
  createReturn,
  // Purchases
  createPurchase,
  approvePurchase,
  receivePurchase,
  // Inventory
  createAdjustment,
  // Expenses
  createExpense,
  updateExpense,
  deleteExpense,
  // Taxes
  createTax,
  updateTax,
  deleteTax,
  // Branches
  createBranch,
  updateBranch,
  // Users
  updateUser,
  suspendUser,
  activateUser,
  // Re-export handler for external use
  handleErrors,
};
