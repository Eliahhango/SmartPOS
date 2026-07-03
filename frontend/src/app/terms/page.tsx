import Link from 'next/link';

const sections = [
  {
    number: '1',
    title: 'Acceptance of Terms',
    content:
      'By accessing or using the SmartPOS platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms, you may not access or use the platform. These terms constitute a legally binding agreement between you and SmartPOS Technologies Inc.',
  },
  {
    number: '2',
    title: 'User Account Responsibilities',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials, including your password and API keys. Any activity that occurs under your account is your responsibility. You must notify us immediately of any unauthorized use of your account. SmartPOS is not liable for any loss or damage arising from your failure to safeguard your credentials.',
  },
  {
    number: '3',
    title: 'Permitted Platform Usage',
    content:
      'The SmartPOS platform is licensed, not sold. You may use the platform solely for your internal business operations in accordance with our documentation. You may not: (a) reverse engineer, decompile, or disassemble the platform; (b) rent, lease, or sublicense access to the platform; (c) use the platform to process transactions for any illegal activity; or (d) attempt to bypass any rate limits or security controls.',
  },
  {
    number: '4',
    title: 'Subscription & Billing',
    content:
      'Paid plans are billed in advance on a monthly or annual basis as selected during checkout. All fees are non-refundable except as expressly stated in our Refund Policy. We reserve the right to modify pricing with 30 days written notice. Late payments may result in service suspension until the outstanding balance is paid in full.',
  },
  {
    number: '5',
    title: 'Limitations of Liability',
    content:
      'To the maximum extent permitted by law, SmartPOS Technologies Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform. Our total liability for any claim arising from these terms shall not exceed the total fees paid by you in the twelve months preceding the claim.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-500/10 selection:text-teal-600">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back anchor */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-600 transition-colors mb-8"
        >
          ← Return to Homepage
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/40 mb-4 uppercase tracking-wider">
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Active as of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.number}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-sm font-bold text-teal-600 shrink-0 mt-0.5">
                  {section.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight mb-2">{section.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">Questions about these terms?</p>
          <p className="text-xs text-slate-400 mb-3">
            Reach our legal team for clarification on any section.
          </p>
          <a
            href="mailto:legal@smartpos.com"
            className="inline-flex px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-500/10 transition-all"
          >
            legal@smartpos.com
          </a>
        </div>
      </div>
    </div>
  );
}
