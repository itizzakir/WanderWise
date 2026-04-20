import React from 'react';
import { ShieldCheck, FileText, RefreshCcw, Mail } from 'lucide-react';

const policySections = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    icon: ShieldCheck,
    points: [
      'WanderWise collects only the information needed to process bookings, provide support, and improve your travel experience.',
      'Account data such as name, email, mobile number, and booking history is stored securely and accessed only for authorized operations.',
      'We do not sell your personal information to third parties. Data is shared only with required travel partners for confirmed services.',
      'You can request account data updates or deletion by contacting our support team.',
    ],
  },
  {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    icon: FileText,
    points: [
      'All bookings are subject to availability and final confirmation from WanderWise and its travel partners.',
      'Travelers are responsible for valid documents such as passports, visas, and any destination-specific permits.',
      'Pricing shown on the platform may change until booking confirmation is completed.',
      'Misuse of the platform, fraudulent transactions, or policy violations may result in account suspension.',
    ],
  },
  {
    id: 'refund-policy',
    title: 'Refund Policy',
    icon: RefreshCcw,
    points: [
      'Refund timelines and eligibility depend on package type, supplier rules, and cancellation window.',
      'Approved refunds are processed back to the original payment method after verification.',
      'Non-refundable components such as certain flights, permits, or promotional bookings will be clearly marked during checkout.',
      'For failed or duplicate payment cases, refunds are initiated automatically after payment gateway reconciliation.',
    ],
  },
];

const LegalAndPolicy = () => {
  return (
    <div className="page-shell pt-32 pb-20">
      <section className="page-container max-w-[1240px]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-primary font-bold text-primary mb-5">
            Legal & Policy
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            These policies explain how WanderWise protects your data, manages bookings, and handles
            cancellations or refunds. Last updated on February 10, 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {policySections.map((section) => {
            const Icon = section.icon;
            return (
              <article
                key={section.id}
                id={section.id}
                className="glass-card p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-primary font-semibold text-gray-800">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="text-gray-600 leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-8 bg-primary text-white rounded-2xl p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-primary font-semibold">Need Policy Clarification?</h3>
            <p className="text-white/90 mt-1">
              Our support team can help with legal, booking, payment, and refund questions.
            </p>
          </div>
          <a
            href="mailto:legal@wanderwise.com"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 transition-colors px-5 py-3 rounded-full font-semibold"
          >
            <Mail size={18} />
            legal@wanderwise.com
          </a>
        </div>
      </section>
    </div>
  );
};

export default LegalAndPolicy;
