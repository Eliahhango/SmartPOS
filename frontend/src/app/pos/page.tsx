'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, Pause, Play, X, CreditCard, Smartphone, Banknote, Building } from 'lucide-react';
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
    if (!query) { setProducts([]); return; }
    try {
      const { data } = await api.get('/products', { params: { search: query, limit: 20 } });
      setProducts(data.products || []);
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

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
    { method: 'cash' as const, icon: Banknote, label: 'Cash', color: 'text-green-600' },
    { method: 'mobile_money' as const, icon: Smartphone, label: 'Mobile Money', color: 'text-blue-600' },
    { method: 'card' as const, icon: CreditCard, label: 'Card', color: 'text-purple-600' },
    { method: 'bank' as const, icon: Building, label: 'Bank Transfer', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowSuspended(true)} className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100">
            Suspended ({suspendedSales.length})
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Product Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products by name, barcode, or SKU..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <input
              type="text" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleBarcode}
              placeholder="Scan barcode..."
              className="w-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
            {products.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="text-left p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.barcode || p.sku}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">{formatCurrency(p.sellingPrice)}</p>
                <p className="text-xs text-gray-400">Stock: {p.stockQuantity}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Cart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-[calc(100vh-180px)]">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} className="text-blue-600" />
            <h2 className="font-semibold">Current Sale</h2>
            <span className="ml-auto text-sm text-gray-400">{cart.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={14} /></button>
                  <span className="w-6 text-center font-mono text-xs">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={14} /></button>
                </div>
                <span className="font-semibold w-20 text-right">{formatCurrency(item.total)}</span>
                <button onClick={() => removeItem(item.productId)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            ))}
            {cart.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Cart is empty. Search and add products.</p>}
          </div>

          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(taxTotal)}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Discount</span>
              <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 text-right px-2 py-1 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span><span className="text-blue-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={suspendSale} disabled={cart.length === 0}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              <Pause size={16} /> Hold
            </button>
            <button onClick={() => setShowPayment(true)} disabled={cart.length === 0}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all">
              <CreditCard size={16} /> Pay {formatCurrency(grandTotal)}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Payment</h3>
              <button onClick={() => { setShowPayment(false); setPayments([]); }}><X size={20} /></button>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-4">{formatCurrency(grandTotal)}</p>

            <div className="space-y-2 mb-4">
              {payments.map((p, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{p.method.replace('_', ' ')}</span>
                    <button onClick={() => removePayment(i)} className="text-red-400"><X size={14} /></button>
                  </div>
                  <input type="number" value={p.amount} onChange={e => updatePayment(i, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" placeholder="Amount" />
                  {p.method === 'cash' && (
                    <input type="number" value={p.amountReceived || ''} onChange={e => updatePayment(i, 'amountReceived', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Amount Received" />
                  )}
                  {p.method === 'cash' && p.changeGiven !== undefined && p.changeGiven > 0 && (
                    <p className="text-sm text-green-600 mt-1">Change: {formatCurrency(p.changeGiven)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {paymentMethods.map(pm => {
                const Icon = pm.icon;
                return (
                  <button key={pm.method} onClick={() => addPayment(pm.method)}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-sm">
                    <Icon size={18} className={pm.color} /> {pm.label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-sm mb-4">
              <span>Total Paid: <strong>{formatCurrency(totalPaid)}</strong></span>
              <span className={Math.abs(totalPaid - grandTotal) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                {totalPaid > grandTotal ? `Over: ${formatCurrency(totalPaid - grandTotal)}` : `Remaining: ${formatCurrency(grandTotal - totalPaid)}`}
              </span>
            </div>

            <button onClick={completeSale}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
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
              <h3 className="text-lg font-bold">Suspended Sales</h3>
              <button onClick={() => setShowSuspended(false)}><X size={20} /></button>
            </div>
            {suspendedSales.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No suspended sales</p>
            ) : (
              <div className="space-y-2">
                {suspendedSales.map((s, i) => (
                  <button key={i} onClick={() => resumeSale(i)}
                    className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="flex justify-between">
                      <span className="font-medium">{s.cart.length} items</span>
                      <span className="text-blue-600 font-semibold">{formatCurrency(s.cart.reduce((sum: number, item: CartItem) => sum + item.total, 0))}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(s.date).toLocaleString()}</span>
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
