'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Play, Star, ChevronDown, ChevronUp, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('multi');
  const [openFaq, setOpenFaq] = useState(0);

  const tabs = [
    { id: 'multi', title: 'Multi Store', desc: 'Manage multiple store locations from a single dashboard. Track inventory across branches, compare store performance, and transfer stock between locations with one click.', features: ['Staff management', 'Omnichannel insights', 'Payment processing', 'Minimal counter'] },
    { id: 'single', title: 'Single Store', desc: 'Everything a single-location business needs — point of sale, inventory control, customer management, and detailed reporting — all in one affordable package.', features: ['Staff management', 'Omnichannel insights', 'Payment processing', 'Minimal counter'] },
    { id: 'restaurant', title: 'Restaurant', desc: 'Built for the pace of food service. Send orders directly to the kitchen, split bills effortlessly, manage table layouts, and track ingredients in real time.', features: ['Kitchen System', 'Omnichannel insights', 'Payment processing', 'Minimal counter'] },
    { id: 'appointment', title: 'Appointment', desc: 'Perfect for salons, clinics, and service businesses. Online booking, automated reminders, staff scheduling, and integrated payments keep your calendar full and your clients happy.', features: ['Multi Reservations', 'Omnichannel insights', 'Payment processing', 'Minimal counter'] },
  ];

  const faqs = [
    { q: 'Is SmartPOS suitable for my type of business?', a: 'Absolutely. SmartPOS is designed to adapt to any retail, restaurant, or service-based business. Our flexible configuration lets you customize product catalogs, tax rates, receipt templates, and user permissions to match your exact workflow.' },
    { q: 'Can I get a customized solution for my business?', a: 'Yes. We offer tailored configurations for your specific needs — from custom receipt templates to specialized reporting dashboards.' },
    { q: 'How secure is SmartPOS for payment processing?', a: 'SmartPOS uses industry-standard encryption, role-based access control, and secure authentication. All payment data is handled with PCI-compliant best practices.' },
    { q: 'How do I contact SmartPOS for more information?', a: 'Reach our support team at support@smartpos.com or call +255 385 502 5004. We respond within 24 hours.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-2xl font-bold gradient-text">SmartPOS</span>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-teal-600">Home</Link>
            <span className="text-sm text-slate-600 cursor-pointer">Features</span>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-teal-600">Dashboard</Link>
            <span className="text-sm text-slate-600 cursor-pointer">Contact</span>
          </div>
          <div className="hidden md:block">
            <Link href="/login" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg transition-shadow">
              Get Started
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-3">
            <Link href="/" className="text-sm font-semibold text-teal-600">Home</Link>
            <span className="text-sm text-slate-600">Features</span>
            <Link href="/dashboard" className="text-sm text-slate-600">Dashboard</Link>
            <span className="text-sm text-slate-600">Contact</span>
            <Link href="/login" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-center px-6 py-2.5 rounded-full text-sm font-semibold">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#090727] via-[#0f0b3d] to-[#1a1050] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 animate-pulse-glow">
              <Play size={14} className="text-indigo-400" fill="currentColor" />
              Fully Integrated Point-of-sale System
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              The Simple, Secure, and Scalable Way to Run Your Business
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Process transactions, track inventory, and manage your entire business from a single intuitive platform trusted by over 10,000 stores worldwide.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105">
                Get Started
              </Link>
              <Link href="#features" className="border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ value: '10K+', label: 'Active Stores' }, { value: '99.9%', label: 'Uptime' }, { value: '25%', label: 'Cost Reduction' }, { value: '15%', label: 'Faster Checkout' }].map((s, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-slate-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Empowering Business Key Features</h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">From payment processing to staff management, SmartPOS delivers every tool you need to run your store efficiently.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Data-Driven Decision-Making', desc: 'Identify your top-selling products, track sales trends, and adjust your inventory and marketing strategies accordingly.' },
              { title: 'Payment Processing', desc: 'Fast and secure payment processing is essential for customer satisfaction. Accept cash, mobile money, cards, and bank transfers.' },
              { title: 'Customer Loyalty', desc: 'Build lasting relationships with loyalty points, purchase history tracking, and personalized customer profiles.' },
              { title: 'Inventory Control', desc: 'Real-time stock tracking, low stock alerts, expiry management, and automated purchase orders keep your shelves optimized.' },
              { title: 'Staff Management', desc: 'Customized access for staff to prevent unauthorized access to sensitive data. Role-based permissions for every team member.' },
              { title: 'Split Payments', desc: 'Accept multiple payment methods in a single transaction — part cash, part mobile money, part card. Full flexibility.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Star size={24} className="text-teal-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Tailored POS Solutions for Your Unique Store</h2>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {tab.title}
              </button>
            ))}
          </div>
          {tabs.filter(t => t.id === activeTab).map(tab => (
            <div key={tab.id} className="grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl h-80 flex items-center justify-center">
                <div className="text-6xl">🏪</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Empowering Your {tab.title} Success</h3>
                <p className="text-slate-500 mb-6">{tab.desc}</p>
                <div className="grid grid-cols-2 gap-3">
                  {tab.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center"><span className="text-emerald-600 text-xs">✓</span></div>
                      <span className="text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" className="inline-flex items-center gap-2 mt-6 text-teal-600 font-semibold hover:gap-3 transition-all">
                  Learn More <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Satisfied Clients Share Their Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Piper Girard', role: 'Boutique Owner', text: 'SmartPOS transformed the way we do business. Their POS system is user-friendly, and the inventory management feature has saved us countless hours.' },
              { name: 'John Doe', role: 'Cafe Owner', text: 'SmartPOS has been a game-changer for us. With their reliable payment processing and intuitive interface, we can focus on providing great food and service.' },
              { name: 'Camille Clark', role: 'Salon Owner', text: 'SmartPOS has simplified our appointment scheduling and payment processing. Our clients love the convenience, and we appreciate the security and ease of use.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="flex gap-1 mb-3">{Array(5).fill(0).map((_, j) => <Star key={j} size={16} className="text-yellow-400" fill="currentColor" />)}</div>
                <p className="text-slate-600 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full" />
                  <div><p className="font-semibold text-sm">{t.name}</p><p className="text-slate-400 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Get Quick Answers to Your Concerns</h2>
          <p className="text-slate-500 text-center mb-12">Find answers to the most common questions about SmartPOS setup, security, pricing, and features.</p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-slate-50 transition-colors">
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={20} className="text-teal-600" /> : <ChevronDown size={20} />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-slate-600 text-sm animate-fade-in-up">{faq.a}</div>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-slate-500 text-sm">
            Have a question we didn&apos;t cover? Reach our support team at{' '}
            <span className="text-teal-600 font-semibold">support@smartpos.com</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#090727] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">Join thousands of businesses that have already upgraded their operations. Start your free 14-day trial — no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-white/80"><Phone size={16} /> +255 385 502 5004</div>
            <div className="flex items-center gap-2 text-white/80"><Mail size={16} /> contact@smartpos.com</div>
          </div>
          <Link href="/login" className="inline-block mt-8 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-10 py-3.5 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#090727] text-white/60 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">{[ 'Home', 'About Us', 'Features', 'Pricing' ].map(l => <p key={l}>{l}</p>)}</div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Services</h3>
              <div className="space-y-2 text-sm">{[ 'Commerce', 'Payments', 'Point of Sale', 'Stock Management' ].map(l => <p key={l}>{l}</p>)}</div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Support</h3>
              <div className="space-y-2 text-sm">{[ 'Help Center', 'Documentation', 'API Reference', 'Contact' ].map(l => <p key={l}>{l}</p>)}</div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><MapPin size={14} /> Dar es Salaam, Tanzania</div>
                <div className="flex items-center gap-2"><Phone size={14} /> +255 385 502 5004</div>
                <div className="flex items-center gap-2"><Mail size={14} /> contact@smartpos.com</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} SmartPOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
