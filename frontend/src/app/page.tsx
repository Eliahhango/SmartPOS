'use client';

export default function HomePage() {
  const corporateFeatures = [
    {
      icon: (
        <svg className="w-5 h-5 text-slate-700 group-hover:text-teal-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Real-Time Inventory Tracking',
      text: 'Automate stock count updates, receive low inventory triggers, and sync multi-location warehouse sheets effortlessly.'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-slate-700 group-hover:text-teal-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      ),
      title: 'Advanced Sales Analytics',
      text: 'Generate revenue graphs, customer growth indicators, and tax calculation matrix summaries in one click.'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-slate-700 group-hover:text-teal-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Multi-Mode Split Payments',
      text: 'Securely handle credit ledger transactions, local mobile money assets, and physical cash accounting pipelines.'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans antialiased selection:bg-teal-500/10 selection:text-teal-600">
      
      {/* 1. Global Enterprise Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Smart<span className="text-teal-500">POS</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 tracking-wide uppercase">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#metrics" className="hover:text-slate-900 transition-colors">Performance</a>
            <a href="mailto:support@smartpos.com" className="hover:text-slate-900 transition-colors">Enterprise Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="/login" 
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 shadow-sm transition-all duration-150"
            >
              Sign In to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* 2. Asymmetric Conversion Hero Area */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-100 bg-white">
        {/* Subtle Brand Background Glow Gradients */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-slate-200 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/40 mb-6 uppercase tracking-wider">
            Next-Gen Point of Sale Ecosystem
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-[1.1]">
            The Simple, Secure, and Scalable Way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">Run Your Business</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            A modern point-of-sale platform designed to optimize retail checkouts, automate warehouse inventory auditing, and deliver high-fidelity management reporting from any device.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a 
              href="/login" 
              className="px-6 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-600/20 active:scale-[0.99] transition-all text-sm"
            >
              Launch Live Application Demo
            </a>
            <a 
              href="#features" 
              className="px-6 py-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl transition-all text-sm"
            >
              Explore Platform Modules
            </a>
          </div>
        </div>
      </section>

      {/* 3. Micro Validation Performance Metrics Row */}
      <section id="metrics" className="bg-slate-100/60 py-10 border-b border-slate-200/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="block text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">99.98%</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Platform Uptime</span>
            </div>
            <div>
              <span className="block text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">&lt; 200ms</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Checkout Latency</span>
            </div>
            <div>
              <span className="block text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">25M+</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Invoices Processed</span>
            </div>
            <div>
              <span className="block text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">24/7</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Enterprise Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core System Capability Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Engineered for Modern Enterprise Retail</h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">Everything you need to handle high-frequency checkout operations smoothly and safely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {corporateFeatures.map((feat, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-teal-500/10 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors mb-5 shadow-sm">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-teal-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-3 text-xs text-slate-400 font-medium leading-relaxed">
                  {feat.text}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center text-xs font-bold text-slate-400 group-hover:text-teal-500 transition-colors">
                Learn workflow status →
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
