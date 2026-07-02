const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SmartPOS database...');

  // Create main branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Store',
      address: '123 Main Street, Dar es Salaam',
      phone: '+255 123 456 789',
      isMainBranch: true
    }
  });
  console.log('Branch created:', branch.name);

  // Create tax rates
  const standardVat = await prisma.taxRate.create({
    data: { name: 'Standard VAT', ratePercent: 18, isActive: true }
  });
  const exempt = await prisma.taxRate.create({
    data: { name: 'Exempt', ratePercent: 0, isActive: true }
  });
  const zeroRated = await prisma.taxRate.create({
    data: { name: 'Zero-Rated', ratePercent: 0, isActive: true }
  });
  console.log('Tax rates created');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@smartpos.com',
      phone: '+255 700 000 001',
      password: adminPassword,
      role: 'admin',
      branchId: branch.id,
      status: 'active'
    }
  });

  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.create({
    data: {
      name: 'Store Manager',
      email: 'manager@smartpos.com',
      phone: '+255 700 000 002',
      password: managerPassword,
      role: 'manager',
      branchId: branch.id,
      status: 'active'
    }
  });

  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.create({
    data: {
      name: 'Cashier One',
      email: 'cashier@smartpos.com',
      phone: '+255 700 000 003',
      password: cashierPassword,
      role: 'cashier',
      branchId: branch.id,
      status: 'active'
    }
  });

  const stockPassword = await bcrypt.hash('stock123', 10);
  const stockOfficer = await prisma.user.create({
    data: {
      name: 'Stock Officer',
      email: 'stock@smartpos.com',
      phone: '+255 700 000 004',
      password: stockPassword,
      role: 'stock_officer',
      branchId: branch.id,
      status: 'active'
    }
  });
  console.log('Users created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Beverages', description: 'Drinks and beverages' } }),
    prisma.category.create({ data: { name: 'Groceries', description: 'Food and grocery items' } }),
    prisma.category.create({ data: { name: 'Dairy & Eggs', description: 'Dairy products and eggs' } }),
    prisma.category.create({ data: { name: 'Bakery', description: 'Bread and baked goods' } }),
    prisma.category.create({ data: { name: 'Snacks', description: 'Snacks and confectionery' } }),
    prisma.category.create({ data: { name: 'Household', description: 'Household items' } }),
    prisma.category.create({ data: { name: 'Personal Care', description: 'Personal care products' } }),
    prisma.category.create({ data: { name: 'Electronics', description: 'Electronic items' } })
  ]);
  console.log('Categories created');

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'Tanzania Breweries Ltd', phone: '+255 22 123 4567', email: 'orders@tbl.co.tz', address: 'Dar es Salaam', tinNumber: 'TIN-001' } }),
    prisma.supplier.create({ data: { name: 'Bakhresa Food Products', phone: '+255 22 234 5678', email: 'sales@bakhresa.com', address: 'Dar es Salaam', tinNumber: 'TIN-002' } }),
    prisma.supplier.create({ data: { name: 'Azam Distributors', phone: '+255 22 345 6789', email: 'orders@azam.com', address: 'Dar es Salaam', tinNumber: 'TIN-003' } }),
    prisma.supplier.create({ data: { name: 'General Wholesale Ltd', phone: '+255 22 456 7890', email: 'info@genwholesale.co.tz', address: 'Mwanza', tinNumber: 'TIN-004' } })
  ]);
  console.log('Suppliers created');

  // Create products
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Coca Cola 500ml', barcode: '6001234567890', sku: 'BEV-001', categoryId: categories[0].id, supplierId: suppliers[3].id, costPrice: 800, sellingPrice: 1200, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 250, minimumStock: 20 } }),
    prisma.product.create({ data: { name: 'Fanta Orange 500ml', barcode: '6001234567891', sku: 'BEV-002', categoryId: categories[0].id, supplierId: suppliers[3].id, costPrice: 800, sellingPrice: 1200, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 200, minimumStock: 20 } }),
    prisma.product.create({ data: { name: 'Rice 1kg', barcode: '6001234567892', sku: 'GRO-001', categoryId: categories[1].id, supplierId: suppliers[1].id, costPrice: 2000, sellingPrice: 2800, taxClassId: exempt.id, unit: 'kg', stockQuantity: 500, minimumStock: 50 } }),
    prisma.product.create({ data: { name: 'Sugar 1kg', barcode: '6001234567893', sku: 'GRO-002', categoryId: categories[1].id, supplierId: suppliers[1].id, costPrice: 1800, sellingPrice: 2500, taxClassId: exempt.id, unit: 'kg', stockQuantity: 300, minimumStock: 30 } }),
    prisma.product.create({ data: { name: 'Cooking Oil 1L', barcode: '6001234567894', sku: 'GRO-003', categoryId: categories[1].id, supplierId: suppliers[2].id, costPrice: 3500, sellingPrice: 4500, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 150, minimumStock: 15 } }),
    prisma.product.create({ data: { name: 'Milk 500ml', barcode: '6001234567895', sku: 'DAI-001', categoryId: categories[2].id, supplierId: suppliers[3].id, costPrice: 1500, sellingPrice: 2000, taxClassId: exempt.id, unit: 'pcs', stockQuantity: 100, minimumStock: 15, expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
    prisma.product.create({ data: { name: 'Eggs Tray (30)', barcode: '6001234567896', sku: 'DAI-002', categoryId: categories[2].id, supplierId: suppliers[3].id, costPrice: 8000, sellingPrice: 10000, taxClassId: exempt.id, unit: 'pcs', stockQuantity: 80, minimumStock: 10, expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } }),
    prisma.product.create({ data: { name: 'Bread Loaf', barcode: '6001234567897', sku: 'BAK-001', categoryId: categories[3].id, supplierId: suppliers[1].id, costPrice: 1000, sellingPrice: 1500, taxClassId: exempt.id, unit: 'pcs', stockQuantity: 60, minimumStock: 10, expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } }),
    prisma.product.create({ data: { name: 'Biscuits Pack', barcode: '6001234567898', sku: 'SNK-001', categoryId: categories[4].id, supplierId: suppliers[2].id, costPrice: 500, sellingPrice: 800, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 400, minimumStock: 30 } }),
    prisma.product.create({ data: { name: 'Washing Powder 500g', barcode: '6001234567899', sku: 'HOU-001', categoryId: categories[5].id, supplierId: suppliers[3].id, costPrice: 2500, sellingPrice: 3500, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 120, minimumStock: 15 } }),
    prisma.product.create({ data: { name: 'Soap Bar', barcode: '6001234567900', sku: 'PER-001', categoryId: categories[6].id, supplierId: suppliers[3].id, costPrice: 800, sellingPrice: 1200, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 300, minimumStock: 25 } }),
    prisma.product.create({ data: { name: 'Bottled Water 1.5L', barcode: '6001234567901', sku: 'BEV-003', categoryId: categories[0].id, supplierId: suppliers[3].id, costPrice: 500, sellingPrice: 800, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 500, minimumStock: 50 } }),
    prisma.product.create({ data: { name: 'Maize Flour 1kg', barcode: '6001234567902', sku: 'GRO-004', categoryId: categories[1].id, supplierId: suppliers[1].id, costPrice: 1200, sellingPrice: 1800, taxClassId: exempt.id, unit: 'kg', stockQuantity: 200, minimumStock: 20 } }),
    prisma.product.create({ data: { name: 'Tea Bags 100pk', barcode: '6001234567903', sku: 'BEV-004', categoryId: categories[0].id, supplierId: suppliers[2].id, costPrice: 3000, sellingPrice: 4000, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 90, minimumStock: 10 } }),
    prisma.product.create({ data: { name: 'Toothpaste', barcode: '6001234567904', sku: 'PER-002', categoryId: categories[6].id, supplierId: suppliers[3].id, costPrice: 1500, sellingPrice: 2200, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 180, minimumStock: 20 } }),
    prisma.product.create({ data: { name: 'AA Batteries 4pk', barcode: '6001234567905', sku: 'ELE-001', categoryId: categories[7].id, supplierId: suppliers[3].id, costPrice: 2000, sellingPrice: 3000, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 75, minimumStock: 10 } }),
    prisma.product.create({ data: { name: 'Cooking Oil 5L', barcode: '6001234567906', sku: 'GRO-005', categoryId: categories[1].id, supplierId: suppliers[2].id, costPrice: 15000, sellingPrice: 20000, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 40, minimumStock: 5 } }),
    prisma.product.create({ data: { name: 'Salt 500g', barcode: '6001234567907', sku: 'GRO-006', categoryId: categories[1].id, supplierId: suppliers[1].id, costPrice: 500, sellingPrice: 800, taxClassId: exempt.id, unit: 'pcs', stockQuantity: 350, minimumStock: 30 } }),
    prisma.product.create({ data: { name: 'Juice 1L', barcode: '6001234567908', sku: 'BEV-005', categoryId: categories[0].id, supplierId: suppliers[2].id, costPrice: 2500, sellingPrice: 3500, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 130, minimumStock: 15 } }),
    prisma.product.create({ data: { name: 'Matches Box', barcode: '6001234567909', sku: 'HOU-002', categoryId: categories[5].id, supplierId: suppliers[3].id, costPrice: 100, sellingPrice: 200, taxClassId: standardVat.id, unit: 'pcs', stockQuantity: 1000, minimumStock: 100 } })
  ]);
  console.log('Products created');

  // Create a customer
  const customer = await prisma.customer.create({
    data: { name: 'John Doe', phone: '+255 712 345 678', email: 'john@example.com', address: 'Kinondoni, Dar es Salaam', points: 150 }
  });
  console.log('Customer created');

  // Create some sample sales
  const sale1Items = [
    { productId: products[0].id, quantity: 2, price: 1200, taxRateApplied: 18, total: 2400 },
    { productId: products[3].id, quantity: 1, price: 2500, taxRateApplied: 0, total: 2500 },
    { productId: products[8].id, quantity: 2, price: 800, taxRateApplied: 18, total: 1600 },
    { productId: products[19].id, quantity: 1, price: 200, taxRateApplied: 18, total: 200 }
  ];

  const sale1 = await prisma.sale.create({
    data: {
      invoiceNo: 'INV-20260702-0001',
      customerId: customer.id,
      cashierId: cashier.id,
      branchId: branch.id,
      subtotal: 6100,
      discount: 0,
      taxTotal: 900,
      grandTotal: 7000,
      status: 'completed',
      items: { create: sale1Items },
      payments: {
        create: [
          { method: 'cash', amount: 7000, amountReceived: 10000, changeGiven: 3000 }
        ]
      }
    },
    include: { items: true }
  });

  const sale2Items = [
    { productId: products[2].id, quantity: 2, price: 2800, taxRateApplied: 0, total: 5600 },
    { productId: products[12].id, quantity: 1, price: 1800, taxRateApplied: 0, total: 1800 },
    { productId: products[17].id, quantity: 1, price: 800, taxRateApplied: 0, total: 800 }
  ];

  const sale2 = await prisma.sale.create({
    data: {
      invoiceNo: 'INV-20260702-0002',
      cashierId: cashier.id,
      branchId: branch.id,
      subtotal: 8000,
      discount: 500,
      taxTotal: 0,
      grandTotal: 7500,
      status: 'completed',
      items: { create: sale2Items },
      payments: {
        create: [
          { method: 'mobile_money', amount: 4000, referenceNo: 'MPESA-TXN-001' },
          { method: 'cash', amount: 3500, amountReceived: 5000, changeGiven: 1500 }
        ]
      }
    },
    include: { items: true }
  });

  // Update stock for sales
  for (const item of sale1Items) {
    await prisma.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
  }
  for (const item of sale2Items) {
    await prisma.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
  }

  // Create stock movements for sales
  for (const item of sale1Items) {
    await prisma.stockMovement.create({
      data: { productId: item.productId, branchId: branch.id, changeQty: -item.quantity, reason: 'sale', referenceType: 'sale', referenceId: sale1.id, userId: cashier.id }
    });
  }
  for (const item of sale2Items) {
    await prisma.stockMovement.create({
      data: { productId: item.productId, branchId: branch.id, changeQty: -item.quantity, reason: 'sale', referenceType: 'sale', referenceId: sale2.id, userId: cashier.id }
    });
  }

  // Create some expenses
  await prisma.expense.createMany({
    data: [
      { expenseType: 'Rent', amount: 500000, description: 'Monthly store rent', branchId: branch.id, date: new Date('2026-07-01') },
      { expenseType: 'Electricity', amount: 85000, description: 'June electricity bill', branchId: branch.id, date: new Date('2026-07-01') },
      { expenseType: 'Internet', amount: 50000, description: 'Monthly internet', branchId: branch.id, date: new Date('2026-07-01') },
      { expenseType: 'Transport', amount: 30000, description: 'Delivery transport', branchId: branch.id, date: new Date('2026-07-02') },
      { expenseType: 'Salary', amount: 1200000, description: 'Staff salaries June', branchId: branch.id, date: new Date('2026-06-30') }
    ]
  });

  console.log('Sample sales, stock movements, and expenses created');
  console.log('\n--- Seed Complete ---');
  console.log('Login credentials:');
  console.log('  Admin:    admin@smartpos.com / admin123');
  console.log('  Manager:  manager@smartpos.com / manager123');
  console.log('  Cashier:  cashier@smartpos.com / cashier123');
  console.log('  Stock:    stock@smartpos.com / stock123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
