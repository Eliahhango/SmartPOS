import Link from 'next/link';

const sections = [
  {
    title: 'Data Encryption',
    icon: '🔐',
    description:
      'All sensitive data stored within the SmartPOS platform is encrypted at rest using AES-256 encryption. Data transmitted between your devices and our servers is protected by TLS 1.3, ensuring every transaction, customer record, and inventory log remains private and tamper-proof.',
    highlights: ['AES-256 encryption at rest', 'TLS 1.3 in transit', 'PCI-compliant data handling'],
  },
  {
    title: 'Network Security & Cloud Isolation',
    icon: '☁️',
    description:
      'SmartPOS operates on fully isolated, multi-tenant cloud infrastructure. Each customer deployment is containerized with strict network segmentation, granular firewall rules, and real-time intrusion detection. Access to production systems requires multi-factor authentication and is logged audibly.',
    highlights: ['Multi-tenant isolation', 'Real-time threat detection', 'MFA-protected infrastructure access'],
  },
  {
    title: 'Infrastructure Reliability',
    icon: '⚡',
    description:
      'Our platform is built on a globally distributed cloud architecture with automated failover, redundant power supplies, and continuous monitoring. We deliver a 99.98% uptime SLA for enterprise customers, with proactive incident response and transparent post-mortem reporting.',
    highlights: ['99.98% uptime SLA', 'Automated failover', '24/7 proactive monitoring'],
  },
  {
    title: 'Vulnerability Disclosure',
    icon: '🛡️',
    description:
      'We welcome responsible disclosure from the security research community. If you discover a potential vulnerability, please report it privately to security@smartpos.com. Our team commits to acknowledging receipt within 48 hours and delivering a verified fix within 14 calendar days of confirmation.',
    highlights: ['48-hour acknowledgment', '14-day fix timeline', 'Safe harbor for researchers'],
  },
];

export default function SecurityPage() {
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
            Trust &amp; Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Security Center</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Active as of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Intro */}
        <p className="text-sm text-slate-600 leading-relaxed mb-12 max-w-2xl">
          SmartPOS is architected with security at every layer — from the chip in the card reader to the
          data center that processes your transactions. We adhere to industry-standard security frameworks
          and undergo regular third-party audits to ensure your data stays protected.
        </p>

        {/* Sections grid */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-lg shrink-0 border border-teal-100">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight mb-2">{section.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{section.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {section.highlights.map((h, j) => (
                      <span
                        key={j}
                        className="inline-flex px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-500"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report CTA */}
        <div className="mt-10 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">Report a Security Issue</p>
          <p className="text-xs text-slate-400 mb-3">
            Send responsible disclosure reports to our security team.
          </p>
          <a
            href="mailto:security@smartpos.com"
            className="inline-flex px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-500/10 transition-all"
          >
            security@smartpos.com
          </a>
        </div>
      </div>
    </div>
  );
}
