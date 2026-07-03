'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Minus, Trash2, ShoppingCart, Pause, X, CreditCard, Smartphone, Banknote, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

interface CartItem {
  productId: number;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  taxRate: number;
  total: number;
}

interface PaymentMethod {
  method: 'cash' | 'mobile_money' | 'card' | 'bank';
  amount: number;
  amountReceived?: number;
  changeGiven?: number;
  referenceNo?: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [suspendedSales, setSuspendedSales] = useState<any[]>([]);
  const [showSuspended, setShowSuspended] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef: receiptRef });

  const fetchProducts = useCallback(async (query: string) => {
    try {
      const params: any = { limit: 50 };
      if (query) params.search = query;
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch {}
  }, []);

  // Load initial products on mount; refine on search
  useEffect(() => { fetchProducts(''); }, [fetchProducts]);

  useEffect(() => {
    if (!search && products.length > 0) return; // already loaded
    const timer = setTimeout(() => fetchProducts(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleBarcode = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      try {
        const { data } = await api.get('/products', { params: { search: barcodeInput, limit: 1 } });
        if (data.products?.length > 0) {
          addToCart(data.products[0]);
          setBarcodeInput('');
        }
      } catch {}
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        barcode: product.barcode || '',
        price: parseFloat(product.sellingPrice),
        quantity: 1,
        taxRate: product.taxClass?.ratePercent || 0,
        total: parseFloat(product.sellingPrice)
      }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: newQty, total: newQty * i.price };
    }));
  };

  const removeItem = (productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const taxTotal = cart.reduce((s, i) => {
    const lineTax = (i.total * i.taxRate) / (100 + i.taxRate);
    return s + lineTax;
  }, 0);
  const grandTotal = subtotal - discount;

  const addPayment = (method: PaymentMethod['method']) => {
    const remaining = grandTotal - payments.reduce((s, p) => s + p.amount, 0);
    setPayments(prev => [...prev, { method, amount: remaining, amountReceived: method === 'cash' ? remaining : undefined }]);
  };

  const updatePayment = (index: number, field: string, value: number) => {
    setPayments(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const updated = { ...p, [field]: value };
      if (field === 'amountReceived' && p.method === 'cash') {
        updated.changeGiven = Math.max(0, value - p.amount);
      }
      return updated;
    }));
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  const completeSale = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (Math.abs(totalPaid - grandTotal) > 0.01) return toast.error('Payment total does not match grand total');

    try {
      const { data } = await api.post('/sales', {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        payments: payments.map(p => ({
          method: p.method,
          amount: p.amount,
          amountReceived: p.amountReceived,
          changeGiven: p.changeGiven,
          referenceNo: p.referenceNo
        })),
        discount
      });
      setLastSale(data);
      setCart([]);
      setPayments([]);
      setDiscount(0);
      setShowPayment(false);
      toast.success('Sale completed!');
      setTimeout(() => handlePrint(), 300);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete sale');
    }
  };

  const suspendSale = async () => {
    toast.success('Sale suspended (local only)');
    setSuspendedSales(prev => [...prev, { cart, discount, date: new Date() }]);
    setCart([]);
    setDiscount(0);
  };

  const resumeSale = (index: number) => {
    const s = suspendedSales[index];
    setCart(s.cart);
    setDiscount(s.discount);
    setSuspendedSales(prev => prev.filter((_, i) => i !== index));
    setShowSuspended(false);
  };

  const paymentMethods = [
    { method: 'cash' as const, icon: Banknote, label: 'Cash', color: 'text-emerald-600' },
    { method: 'mobile_money' as const, icon: Smartphone, label: 'Mobile Money', color: 'text-teal-600' },
    { method: 'card' as const, icon: CreditCard, label: 'Card', color: 'text-teal-600' },
    { method: 'bank' as const, icon: Building, label: 'Bank Transfer', color: 'text-teal-600' },
  ];

  return (
    <div className="w-full flex flex-col gap-4 px-4 sm:px-6 py-6 bg-slate-50/50 min-h-screen">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Point of Sale</h1>
        <button onClick={() => setShowSuspended(true)}
          className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200/50 text-xs font-semibold px-3 py-1 rounded-full shadow-sm hover:bg-amber-100 transition-colors">
          Suspended ({suspendedSales.length})
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left Side: Product Search & Grid Panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-full">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products by name, barcode, or SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <input
              type="text" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleBarcode}
              placeholder="Scan barcode..."
              className="w-full sm:w-1/3 px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[450px] xl:max-h-[500px] overflow-y-auto">
              {products.map(p => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="text-left p-3 bg-white border border-slate-100 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all w-full">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.barcode || p.sku}</p>
                  <p className="text-sm font-bold text-teal-600 mt-1">{formatCurrency(p.sellingPrice)}</p>
                  <p className="text-xs text-slate-400">Stock: {p.stockQuantity}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl min-h-[300px] sm:min-h-[500px] flex flex-col items-center justify-center p-6 bg-slate-50/50">
              <ShoppingCart size={32} className="text-slate-300 mb-3 shrink-0" />
              <p className="text-sm font-medium text-slate-400 text-center">No products found. Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Right Side: Current Sale Cart Panel */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col min-h-[300px] xl:min-h-[580px] justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-teal-500 shrink-0" />
                <h3 className="font-bold text-slate-800">Current Sale</h3>
              </div>
              <span className="text-xs bg-slate-100 font-semibold text-slate-500 px-2 py-0.5 rounded-md shrink-0">{cart.length} items</span>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 mb-4 max-h-[240px] sm:max-h-[320px] overflow-y-auto">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center gap-1.5 sm:gap-2 p-2.5 bg-slate-50 rounded-lg text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate text-xs sm:text-sm">{item.name}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400">{formatCurrency(item.price)} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                    <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:bg-slate-200 rounded transition-colors"><Minus size={14} className="text-slate-500" /></button>
                    <span className="w-5 sm:w-6 text-center font-mono text-xs text-slate-700">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:bg-slate-200 rounded transition-colors"><Plus size={14} className="text-slate-500" /></button>
                  </div>
                  <span className="font-semibold text-slate-800 w-16 sm:w-20 text-right text-[11px] sm:text-xs shrink-0">{formatCurrency(item.total)}</span>
                  <button onClick={() => removeItem(item.productId)} className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                  <p className="text-sm font-medium text-slate-400">Cart is empty. Search and add products.</p>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Calculations Panel */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Tax</span>
              <span className="font-medium text-slate-700">{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Discount</span>
              <div className="relative w-20 sm:w-24">
                <input
                  type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full text-right pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-baseline border-t border-slate-100 pt-3 pb-1">
              <span className="text-base font-bold text-slate-800">Total</span>
              <span className="text-xl font-extrabold text-teal-600">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button onClick={suspendSale} disabled={cart.length === 0}
                className="flex-1 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                <Pause size={16} /> Hold
              </button>
              <button onClick={() => setShowPayment(true)} disabled={cart.length === 0}
                className="flex-[2] py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 disabled:opacity-50">
                <CreditCard size={16} /> Pay {formatCurrency(grandTotal)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Payment</h3>
              <button onClick={() => { setShowPayment(false); setPayments([]); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-2xl font-bold text-teal-600 mb-4">{formatCurrency(grandTotal)}</p>

            <div className="space-y-2 mb-4">
              {payments.map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 capitalize">{p.method.replace('_', ' ')}</span>
                    <button onClick={() => removePayment(i)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                  </div>
                  <input type="number" value={p.amount} onChange={e => updatePayment(i, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-teal-500" placeholder="Amount" />
                  {p.method === 'cash' && (
                    <input type="number" value={p.amountReceived || ''} onChange={e => updatePayment(i, 'amountReceived', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="Amount Received" />
                  )}
                  {p.method === 'cash' && p.changeGiven !== undefined && p.changeGiven > 0 && (
                    <p className="text-sm text-emerald-600 font-medium mt-1">Change: {formatCurrency(p.changeGiven)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {paymentMethods.map(pm => {
                const Icon = pm.icon;
                return (
                  <button key={pm.method} onClick={() => addPayment(pm.method)}
                    className="flex items-center justify-center sm:justify-start gap-2 p-3 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all text-sm w-full">
                    <Icon size={18} className={pm.color} /> <span className="text-slate-700 font-medium truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-sm mb-4">
              <span className="text-slate-500">Total Paid: <strong className="text-slate-700">{formatCurrency(totalPaid)}</strong></span>
              <span className={Math.abs(totalPaid - grandTotal) < 0.01 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                {totalPaid > grandTotal ? `Over: ${formatCurrency(totalPaid - grandTotal)}` : `Remaining: ${formatCurrency(grandTotal - totalPaid)}`}
              </span>
            </div>

            <button onClick={completeSale}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-500/10">
              Complete Sale
            </button>
          </div>
        </div>
      )}

      {/* Suspended Sales Modal */}
      {showSuspended && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Suspended Sales</h3>
              <button onClick={() => setShowSuspended(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {suspendedSales.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No suspended sales</p>
            ) : (
              <div className="space-y-2">
                {suspendedSales.map((s, i) => (
                  <button key={i} onClick={() => resumeSale(i)}
                    className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-teal-50 transition-colors border border-slate-100">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">{s.cart.length} items</span>
                      <span className="text-teal-600 font-semibold">{formatCurrency(s.cart.reduce((sum: number, item: CartItem) => sum + item.total, 0))}</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(s.date).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt (hidden, for printing) */}
      <div ref={receiptRef} className="hidden print:block p-4 text-sm" style={{ width: '80mm' }}>
        {lastSale && (
          <>
            <div className="text-center mb-2">
              <p className="font-bold">SmartPOS Supermarket</p>
              <p className="text-xs">123 Main Street, Dar es Salaam</p>
              <p className="text-xs">+255 123 456 789</p>
            </div>
            <div className="border-t border-b border-dashed py-1 mb-2 text-xs">
              <p>Receipt: {lastSale.invoiceNo}</p>
              <p>Date: {new Date(lastSale.createdAt).toLocaleString()}</p>
              <p>Cashier: {lastSale.cashier?.name}</p>
            </div>
            <table className="w-full text-xs mb-2">
              <thead><tr className="border-b border-dashed"><th className="text-left">Item</th><th className="text-right">Qty</th><th className="text-right">Total</th></tr></thead>
              <tbody>
                {lastSale.items?.map((item: any) => (
                  <tr key={item.id}><td>{item.product?.name}</td><td className="text-right">{item.quantity}</td><td className="text-right">{formatCurrency(item.total)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-dashed pt-1 text-xs space-y-0.5">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(lastSale.subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(lastSale.taxTotal)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>{formatCurrency(lastSale.discount)}</span></div>
              <div className="flex justify-between font-bold"><span>TOTAL</span><span>{formatCurrency(lastSale.grandTotal)}</span></div>
            </div>
            <div className="text-xs mt-1">
              <p>Payment: {lastSale.payments?.map((p: any) => `${p.method} ${formatCurrency(p.amount)}`).join(', ')}</p>
            </div>
            <p className="text-center text-xs mt-3">Thank You! Please come again.</p>
          </>
        )}
      </div>
    </div>
  );
}
