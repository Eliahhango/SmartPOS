/**
 * Unit tests for validation middleware.
 * These test express-validator chains in isolation,
 * verifying that correct inputs pass and invalid inputs are rejected.
 */
const httpMocks = require('node-mocks-http');
const { validationResult } = require('express-validator');
const validate = require('../middleware/validate');

/**
 * Helper: run a validation chain against a mock request.
 * Returns the errors array (empty = valid).
 */
async function runValidation(chain, body = {}, params = {}, query = {}) {
  const req = httpMocks.createRequest({ body, params, query });
  const res = httpMocks.createResponse();
  const next = jest.fn();

  // Run each validation middleware in sequence
  for (const middleware of chain) {
    // Skip the handleErrors middleware — we want to inspect errors directly
    if (middleware === validate.handleErrors) break;
    await new Promise((resolve) => middleware(req, res, resolve));
  }

  const errors = validationResult(req);
  return errors.array();
}

describe('Validation: Auth', () => {
  describe('login', () => {
    it('accepts valid email and password', async () => {
      const errors = await runValidation(validate.login, {
        email: 'test@example.com',
        password: 'Password1!'
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects missing email', async () => {
      const errors = await runValidation(validate.login, {
        password: 'Password1!'
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].msg).toMatch(/email/i);
    });

    it('rejects invalid email format', async () => {
      const errors = await runValidation(validate.login, {
        email: 'not-an-email',
        password: 'Password1!'
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects empty password', async () => {
      const errors = await runValidation(validate.login, {
        email: 'test@example.com',
        password: ''
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('register', () => {
    it('accepts valid registration data', async () => {
      const errors = await runValidation(validate.register, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        phone: '+255712345678'
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects weak password (no uppercase)', async () => {
      const errors = await runValidation(validate.register, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password1!'
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].msg).toMatch(/uppercase/i);
    });

    it('rejects weak password (no digit)', async () => {
      const errors = await runValidation(validate.register, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password!'
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].msg).toMatch(/digit/i);
    });

    it('rejects weak password (no special char)', async () => {
      const errors = await runValidation(validate.register, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1'
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].msg).toMatch(/special/i);
    });

    it('rejects password shorter than 8 chars', async () => {
      const errors = await runValidation(validate.register, {
        name: 'Test',
        email: 'test@test.com',
        password: 'Ab1!'
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects missing name', async () => {
      const errors = await runValidation(validate.register, {
        email: 'test@test.com',
        password: 'Password1!'
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Validation: Products', () => {
  describe('createProduct', () => {
    it('accepts valid product data', async () => {
      const errors = await runValidation(validate.createProduct, {
        name: 'Test Product',
        sellingPrice: 10.99,
        costPrice: 5.50,
        stockQuantity: 100,
        barcode: '123456789'
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects missing name', async () => {
      const errors = await runValidation(validate.createProduct, {
        sellingPrice: 10.99
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects negative price', async () => {
      const errors = await runValidation(validate.createProduct, {
        name: 'Test',
        sellingPrice: -5
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid expiry date', async () => {
      const errors = await runValidation(validate.createProduct, {
        name: 'Test',
        sellingPrice: 10,
        expiryDate: 'not-a-date'
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Validation: Sales', () => {
  describe('createSale', () => {
    it('accepts valid sale data', async () => {
      const errors = await runValidation(validate.createSale, {
        items: [{ productId: 1, quantity: 2 }],
        payments: [{ method: 'cash', amount: 20 }]
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects empty items', async () => {
      const errors = await runValidation(validate.createSale, {
        items: [],
        payments: [{ method: 'cash', amount: 0 }]
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects missing payments', async () => {
      const errors = await runValidation(validate.createSale, {
        items: [{ productId: 1, quantity: 1 }],
        payments: []
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid payment method', async () => {
      const errors = await runValidation(validate.createSale, {
        items: [{ productId: 1, quantity: 1 }],
        payments: [{ method: 'bitcoin', amount: 10 }]
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects negative discount', async () => {
      const errors = await runValidation(validate.createSale, {
        items: [{ productId: 1, quantity: 1 }],
        payments: [{ method: 'cash', amount: 10 }],
        discount: -5
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Validation: Expenses', () => {
  describe('createExpense', () => {
    it('accepts valid expense', async () => {
      const errors = await runValidation(validate.createExpense, {
        expenseType: 'Rent',
        amount: 1500
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects invalid expense type', async () => {
      const errors = await runValidation(validate.createExpense, {
        expenseType: 'InvalidType',
        amount: 100
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects zero amount', async () => {
      const errors = await runValidation(validate.createExpense, {
        expenseType: 'Rent',
        amount: 0
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Validation: Users', () => {
  describe('updateUser', () => {
    it('rejects invalid role', async () => {
      const errors = await runValidation(validate.updateUser, {
        role: 'superadmin'
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('accepts valid role', async () => {
      const errors = await runValidation(validate.updateUser, {
        role: 'manager',
        name: 'Test'
      }, { id: '1' });
      expect(errors).toHaveLength(0);
    });
  });
});

describe('Validation: Branches', () => {
  describe('createBranch', () => {
    it('accepts valid branch', async () => {
      const errors = await runValidation(validate.createBranch, {
        name: 'Downtown Store'
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects empty name', async () => {
      const errors = await runValidation(validate.createBranch, {
        name: ''
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Validation: Inventory', () => {
  describe('createAdjustment', () => {
    it('accepts valid adjustment', async () => {
      const errors = await runValidation(validate.createAdjustment, {
        productId: 1,
        changeQty: -5,
        reason: 'damage'
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects unknown reason', async () => {
      const errors = await runValidation(validate.createAdjustment, {
        productId: 1,
        changeQty: 10,
        reason: 'theft'
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects missing productId', async () => {
      const errors = await runValidation(validate.createAdjustment, {
        changeQty: 10,
        reason: 'adjustment'
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
