'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Minus, Trash2, ShoppingCart, Pause, X, CreditCard, Smartphone, Banknote, Building, AlertTriangle, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';


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
  method: 'cash' | 'mobile_money' | 'card' | 'bank' | 'credit';
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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [lastSale, setLastSale] = useState<any>(null);
  const [saleWarnings, setSaleWarnings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [splitMode, setSplitMode] = useState(false);
  const [splitBill, setSplitBill] = useState<{ items: CartItem[]; payments: PaymentMethod[]; discount: number } | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const printReceipt = () => {
    if (!lastSale) return;

    // Build receipt HTML with inline styles — no Tailwind dependency
    const s = (v: string | number | undefined | null) => v ?? '';
    const store = {
      name: 'SMARTPOS',
      branch: lastSale.branch?.name || 'Supermarket',
      address: '123 Main Street, Dar es Salaam',
      phone: '+255 123 456 789',
      tin: '123-456-789'
    };
    const fmt = (v: number) => 'TSh ' + Number(v).toLocaleString('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const date = new Date(lastSale.createdAt);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const totalPaid = lastSale.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    const changeTotal = lastSale.payments?.reduce((sum: number, p: any) => sum + (p.changeGiven || 0), 0) || 0;

    const printHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt</title>
<style>
  @page { margin: 0; size: 80mm auto; }
  body { margin: 0; padding: 3mm; font-family: 'Courier New', 'Lucida Console', monospace; font-size: 10px; line-height: 1.35; color: #000; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
  td { padding: 0.5mm 0; vertical-align: top; }
  .c { text-align: center; }
  .r { text-align: right; }
  .b { font-weight: bold; }
  .s8 { font-size: 8px; }
  .s7 { font-size: 7px; }
  .s9 { font-size: 9px; }
  .s11 { font-size: 11px; }
  .s16 { font-size: 16px; }
  .mt1 { margin-top: 1mm; }
  .mt2 { margin-top: 2mm; }
  .mb1 { margin-bottom: 1mm; }
  .mb2 { margin-bottom: 2mm; }
  .dasht { border-top: 1px dashed #000; }
  .dashb { border-bottom: 1px dashed #000; }
  .sol { border-top: 1px solid #000; }
  .pt1 { padding-top: 1mm; }
  .pb1 { padding-bottom: 1mm; }
  .pt05 { padding-top: 0.5mm; }
  .grey { color: #555; }
  .w30 { width: 30%; }
  .w40 { width: 40%; }
  .w50 { width: 50%; }
  .w15 { width: 15%; }
  .w20 { width: 20%; }
  .w60 { width: 60%; }
  .cap { text-transform: capitalize; }
</style></head><body>
  <div class="c mb2 dashb pb1">
    <div class="s16 b">${store.name}</div>
    <div class="s9 mt1">${store.branch}</div>
    <div class="s8">${store.address}</div>
    <div class="s8">Tel: ${store.phone} | TIN: ${store.tin}</div>
  </div>
  <table class="mb1">
    <tr><td class="w30">Receipt:</td><td class="b">${s(lastSale.invoiceNo)}</td></tr>
    <tr><td>Date:</td><td>${dateStr}</td></tr>
    <tr><td>Time:</td><td>${timeStr}</td></tr>
    <tr><td>Cashier:</td><td>${s(lastSale.cashier?.name)}</td></tr>
    ${lastSale.cashier?.branch?.name ? `<tr><td>Branch:</td><td>${lastSale.cashier.branch.name}</td></tr>` : ''}
    ${lastSale.customer ? `<tr><td>Customer:</td><td class="b">${s(lastSale.customer.name)}</td></tr>
    ${lastSale.customer.phone ? `<tr><td>Phone:</td><td>${s(lastSale.customer.phone)}</td></tr>` : ''}
    <tr><td>Points:</td><td>${lastSale.customer.points} pts</td></tr>` : ''}
  </table>
  ${lastSale.customer ? `<div class="dasht dashb s8 pt05 pb1 mb2 grey">Points earned: <b>${Math.floor(lastSale.grandTotal / 1000)} pts</b></div>` : ''}
  <div class="dasht dashb b s9 pt05 pb1 mb1">
    <table><tr><td class="w50">ITEM</td><td class="w15 r">QTY</td><td class="w15 r">TAX</td><td class="w20 r">TOTAL</td></tr></table>
  </div>
  ${(lastSale.items || []).map((item: any) => `
  <div class="mb1">
    <table><tr><td class="w50 b">${s(item.product?.name)}</td><td class="w15 r">${item.quantity}</td><td class="w15 r">${item.taxRateApplied > 0 ? item.taxRateApplied + '%' : '—'}</td><td class="w20 r b">${fmt(item.total)}</td></tr>
    <tr><td class="grey s7">@ ${fmt(item.price)} &times; ${item.quantity}${item.product?.barcode ? ' [' + item.product.barcode + ']' : ''}</td><td colspan="3" class="grey s7 r">${item.product?.taxClass?.name ? 'Tax: ' + item.product.taxClass.name : ''}</td></tr></table>
  </div>`).join('')}
  <div class="dasht pt1 mb2 s9">
    <table><tr><td class="w60">Subtotal</td><td class="w40 r">${fmt(lastSale.subtotal)}</td></tr>
    <tr><td>Tax${lastSale.taxTotal > 0 ? ' (' + ((lastSale.taxTotal / (lastSale.subtotal + lastSale.taxTotal)) * 100).toFixed(1) + '%)' : ' (0%)'}</td><td class="r">${fmt(lastSale.taxTotal)}</td></tr>
    ${lastSale.discount > 0 ? `<tr><td>Discount</td><td class="r">-${fmt(lastSale.discount)}</td></tr>` : ''}
    <tr class="sol b s11"><td class="pt05">TOTAL DUE</td><td class="r pt05">${fmt(lastSale.grandTotal)}</td></tr></table>
  </div>
  <div class="dasht pt1 mb2 s9">
    <div class="b mb1">PAYMENT</div>
    <table>${(lastSale.payments || []).map((p: any) => `<tr><td class="w60 cap">${p.method.replace(/_/g, ' ')}${p.referenceNo ? ' (' + p.referenceNo + ')' : ''}</td><td class="w40 r">${fmt(p.amount)}</td></tr>`).join('')}
    <tr class="dasht"><td class="pt05">Amount Paid</td><td class="r pt05 b">${fmt(totalPaid)}</td></tr>
    ${changeTotal > 0 ? `<tr><td>Change Given</td><td class="r">${fmt(changeTotal)}</td></tr>` : ''}</table>
  </div>
  ${lastSale.customer ? `<div class="c s8 mb1">Points earned: <b>${Math.floor(lastSale.grandTotal / 1000)} pts</b></div>` : ''}
  <div class="c s8 pt1 dasht">
    <div class="b s9 mt1 mb1">Thank you for shopping with us!</div>
    <div>Returns accepted within 7 days</div>
    <div class="mb1">with original receipt.</div>
    <div class="grey s7 mt1">${s(lastSale.invoiceNo)}</div>
    <div class="grey s7">Powered by SmartPOS</div>
  </div>
</body></html>`;

    // Blob URL approach — opens clean standalone receipt window.
    // window.open() during a click handler bypasses popup blockers.
    // The new window contains ONLY the receipt (no page chrome).
    const blob = new Blob([printHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, 'receipt', 'width=400,height=600');
    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
        URL.revokeObjectURL(url);
      };
    } else {
      // window.open blocked — fallback: hidden iframe (no window.print!)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '-9999px';
      iframe.style.bottom = '-9999px';
      iframe.style.width = '80mm';
      iframe.style.height = '1px';
      iframe.style.border = 'none';
      iframe.title = 'Receipt Print';
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(printHTML);
        iframeDoc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 500);
        }, 400);
      }
    }
  };

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

  // Load customers for credit sales
  useEffect(() => {
    api.get('/customers', { params: { limit: 200 } }).then(({ data }) => setCustomers(data.customers)).catch(() => {});
  }, []);

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
        toast.success(`${product.name} × ${existing.quantity + 1}`, { icon: '🛒', duration: 1500 });
        return prev.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
        );
      }
      toast.success(`${product.name} added`, { icon: '🛒', duration: 1500 });
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

  const toggleCheckItem = (productId: number) => {
    setCheckedItems(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const confirmSplit = () => {
    const bill2Items = cart.filter(i => !checkedItems.includes(i.productId));
    const bill1Items = cart.filter(i => checkedItems.includes(i.productId));
    setSplitBill({ items: bill2Items, payments: [], discount: 0 });
    setCart(bill1Items);
    setSplitMode(false);
    setCheckedItems([]);
    setShowPayment(true);
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
      // Validate credit requires customer
      const hasCredit = payments.some(p => p.method === 'credit');
      if (hasCredit && !customerId) return toast.error('Credit sales require a customer');

      const { data } = await api.post('/sales', {
        customerId: customerId || undefined,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        payments: payments.map(p => ({
          method: p.method,
          amount: p.amount,
          amountReceived: p.amountReceived,
          changeGiven: p.changeGiven,
          referenceNo: p.referenceNo
        })),
        discount,
        pointsRedeemed: pointsToRedeem || 0
      });
      setLastSale(data);
      setSaleWarnings(data.warnings || []);
      if (data.warnings?.length > 0) {
        data.warnings.forEach((w: any) => toast(w.message, { icon: '⚠️', duration: 5000 }));
      }
      if (data.rewards?.birthdayDiscount > 0) {
        toast('🎂 Birthday discount applied!', { duration: 4000 });
      }
      if (data.rewards?.pointsRedeemed > 0) {
        toast('⭐ ' + data.rewards.pointsRedeemed + ' points redeemed ($' + data.rewards.pointsDiscount.toFixed(2) + ')', { duration: 4000 });
      }
      setPayments([]);
      setDiscount(0);
      setPointsToRedeem(0);
      setShowPayment(false);
      if (splitBill) {
        const bill2 = splitBill;
        setSplitBill(null);
        setCart(bill2.items);
        toast.success('Bill 2 ready — process payment');
      } else {
        setCart([]);
        toast.success('Sale completed!');
      }
      // Print triggered manually via the receipt confirmation overlay below
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

  // Refs for keyboard shortcut handler (reads latest values without re-subscribing effect)
  const cartRef = useRef(cart);
  const showPaymentRef = useRef(showPayment);
  const lastSaleRef = useRef(lastSale);
  const showSuspendedRef = useRef(showSuspended);
  const showShortcutsRef = useRef(showShortcuts);
  const totalPaidRef = useRef(totalPaid);
  const grandTotalRef = useRef(grandTotal);
  const suspendSaleRef = useRef(suspendSale);
  const completeSaleRef = useRef(completeSale);
  const updateQtyRef = useRef(updateQty);

  cartRef.current = cart;
  showPaymentRef.current = showPayment;
  lastSaleRef.current = lastSale;
  showSuspendedRef.current = showSuspended;
  showShortcutsRef.current = showShortcuts;
  totalPaidRef.current = totalPaid;
  grandTotalRef.current = grandTotal;
  suspendSaleRef.current = suspendSale;
  completeSaleRef.current = completeSale;
  updateQtyRef.current = updateQty;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === 'F1' || e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        barcodeRef.current?.focus();
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        if (cartRef.current.length > 0) setShowPayment(true);
        return;
      }
      if (e.key === 'F5') {
        e.preventDefault();
        if (cartRef.current.length > 0) suspendSaleRef.current();
        return;
      }
      if (e.key === 'F6') {
        e.preventDefault();
        setShowSuspended(true);
        return;
      }
      if (e.key === 'F8' || (e.key === '+' && !isInput)) {
        e.preventDefault();
        const items = cartRef.current;
        if (items.length > 0) updateQtyRef.current(items[items.length - 1].productId, 1);
        return;
      }
      if (e.key === 'F9' || (e.key === '-' && !isInput)) {
        e.preventDefault();
        const items = cartRef.current;
        if (items.length > 0) updateQtyRef.current(items[items.length - 1].productId, -1);
        return;
      }
      if (e.key === 'Escape') {
        if (showPaymentRef.current) {
          setShowPayment(false);
          setPayments([]);
        } else if (lastSaleRef.current) {
          setLastSale(null);
        } else if (showSuspendedRef.current) {
          setShowSuspended(false);
        } else if (showShortcutsRef.current) {
          setShowShortcuts(false);
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (showPaymentRef.current && Math.abs(totalPaidRef.current - grandTotalRef.current) < 0.01) {
          completeSaleRef.current();
        }
        return;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const paymentMethods = [
    { method: 'cash' as const, icon: Banknote, label: 'Cash', color: 'text-emerald-600' },
    { method: 'mobile_money' as const, icon: Smartphone, label: 'Mobile Money', color: 'text-teal-600' },
    { method: 'card' as const, icon: CreditCard, label: 'Card', color: 'text-teal-600' },
    { method: 'bank' as const, icon: Building, label: 'Bank Transfer', color: 'text-teal-600' },
    { method: 'credit' as const, icon: CreditCard, label: 'Credit', color: 'text-violet-600' },
  ];

  return (
    <div className="w-full flex flex-col gap-4 px-4 sm:px-6 py-6 bg-slate-50/50 min-h-screen">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Point of Sale</h1>
        <button onClick={() => setShowShortcuts(true)}
          className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm hover:bg-slate-200 transition-colors">
          <Keyboard size={14} />
        </button>
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
                ref={searchRef}
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products by name, barcode, or SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <input
              ref={barcodeRef}
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
                <div key={item.productId} className={`flex items-center gap-1.5 sm:gap-2 p-2.5 bg-slate-50 rounded-lg text-sm ${splitMode && !checkedItems.includes(item.productId) ? 'opacity-50' : ''}`}>
                  {splitMode && (
                    <input type="checkbox" checked={checkedItems.includes(item.productId)}
                      onChange={() => toggleCheckItem(item.productId)}
                      className="shrink-0 accent-teal-500" />
                  )}
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

          {/* Customer Selector */}
          <div className="mb-3">
            <div className="relative">
              <input type="text" value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerSelect(true); }}
                onFocus={() => setShowCustomerSelect(true)}
                placeholder={customerId ? (customers.find(c => c.id === parseInt(customerId))?.name || 'Select customer') : 'Search customer...'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              {customerId && (
                <button onClick={() => { setCustomerId(''); setCustomerSearch(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-xs font-bold bg-white px-1.5 rounded">
                  ✕
                </button>
              )}
            </div>
            {showCustomerSelect && customerSearch && (
              <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-md max-h-32 overflow-y-auto z-10 relative">
                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                  <button key={c.id} type="button" onClick={() => { setCustomerId(String(c.id)); setCustomerSearch(c.name); setSelectedCustomer(c); setShowCustomerSelect(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <span className="font-medium">{c.name}</span>
                    {c.balance > 0 && <span className="text-red-500 text-xs ml-2">(${c.balance.toFixed(2)})</span>}
                    {c.points > 0 && <span className="text-amber-500 text-xs ml-2">{c.points} pts</span>}
                  </button>
                ))}
                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                  <p className="px-3 py-2 text-xs text-slate-400">No customers found</p>
                )}
              </div>
            )}
            {selectedCustomer && selectedCustomer.points > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-amber-600 font-medium">{selectedCustomer.points} pts available</span>
                <input type="number" min="0" max={selectedCustomer.points} value={pointsToRedeem}
                  onChange={e => setPointsToRedeem(Math.min(parseInt(e.target.value) || 0, selectedCustomer.points))}
                  placeholder="Redeem pts"
                  className="w-20 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 placeholder-amber-400 focus:outline-none focus:border-amber-500" />
                <span className="text-slate-400">=${((pointsToRedeem || 0) / 100).toFixed(2)}</span>
              </div>
            )}
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

            {splitMode && (
              <div className="flex justify-between text-xs text-amber-700 font-medium border-t border-amber-100 pt-3">
                <span>Bill 1: {formatCurrency(cart.filter(i => checkedItems.includes(i.productId)).reduce((s, i) => s + i.total, 0))}</span>
                <span>Bill 2: {formatCurrency(cart.filter(i => !checkedItems.includes(i.productId)).reduce((s, i) => s + i.total, 0))}</span>
              </div>
            )}

            {splitBill && !splitMode && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center justify-between">
                <span>Bill 2 pending ({splitBill.items.length} item{splitBill.items.length !== 1 ? 's' : ''}, {formatCurrency(splitBill.items.reduce((s, i) => s + i.total, 0))})</span>
                <button onClick={() => setSplitBill(null)} className="text-amber-500 hover:text-amber-700 font-medium ml-2">Cancel</button>
              </div>
            )}

            {/* Action Buttons */}
            {!splitMode ? (
              <div className="flex gap-2.5 pt-2">
                <button onClick={suspendSale} disabled={cart.length === 0}
                  className="flex-1 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                  <Pause size={16} /> Hold
                </button>
                <button onClick={() => { setCheckedItems(cart.map(i => i.productId)); setSplitMode(true); }} disabled={cart.length < 2}
                  className="flex-1 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                  Split
                </button>
                <button onClick={() => setShowPayment(true)} disabled={cart.length === 0}
                  className="flex-[2] py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 disabled:opacity-50">
                  <CreditCard size={16} /> Pay {formatCurrency(grandTotal)}
                </button>
              </div>
            ) : (
              <div className="flex gap-2.5 pt-2">
                <button onClick={() => { setSplitMode(false); setCheckedItems([]); }}
                  className="flex-1 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel Split
                </button>
                <button onClick={confirmSplit}
                  disabled={checkedItems.length === 0 || checkedItems.length === cart.length}
                  className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50">
                  Confirm Split
                </button>
              </div>
            )}
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

      {/* ── Receipt Confirmation Overlay ── */}
      {lastSale && !showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-zoom-in text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100/40">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Sale Completed</h3>
            <p className="text-xs text-slate-400 mb-1">{lastSale.invoiceNo}</p>
            <p className="text-2xl font-extrabold text-teal-600 mb-5">{formatCurrency(lastSale.grandTotal)}</p>
            {lastSale.rewards?.birthdayDiscount > 0 && (
              <div className="mb-3 p-2.5 bg-pink-50 border border-pink-200 rounded-xl text-left flex items-center gap-2">
                <span className="text-lg">🎂</span>
                <div>
                  <p className="text-xs font-bold text-pink-700">Birthday Reward</p>
                  <p className="text-[11px] text-pink-600">10% off — saved {formatCurrency(lastSale.rewards.birthdayDiscount)}</p>
                </div>
              </div>
            )}
            {lastSale.rewards?.pointsRedeemed > 0 && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-xs font-bold text-amber-700">Points Redeemed</p>
                  <p className="text-[11px] text-amber-600">{lastSale.rewards.pointsRedeemed} pts — saved {formatCurrency(lastSale.rewards.pointsDiscount)}</p>
                </div>
              </div>
            )}
            {saleWarnings.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <p className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Stock Alerts
                </p>
                {saleWarnings.map((w: any, i: number) => (
                  <p key={i} className="text-[11px] text-amber-700 leading-relaxed">{w.message}</p>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <button onClick={() => { printReceipt(); }}
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-500/10 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Receipt
              </button>
              <button onClick={() => setLastSale(null)}
                className="w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['F1 / F2', 'Focus product search'],
                ['F3', 'Focus barcode scanner'],
                ['F4', 'Open payment'],
                ['F5', 'Suspend sale'],
                ['F6', 'Show suspended sales'],
                ['F8 / +', 'Increase quantity'],
                ['F9 / -', 'Decrease quantity'],
                ['Esc', 'Close modal'],
                ['Ctrl+Enter', 'Complete sale'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                  <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono font-semibold text-slate-600 min-w-[5rem] text-center">{key}</kbd>
                  <span className="text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
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


    </div>
  );
}
