import React from 'react';

const COMPANIES = [
  'Google', 'Amazon', 'Netflix', 'Meta', 'Apple', 'Atlassian',
  'Razorpay', 'CRED', 'Meesho', 'Nvidia', 'Adobe', 'Snowflake',
  'Stripe', 'Airbnb',
];

const SocialProofStrip: React.FC = () => {
  return (
    <div className="bg-[var(--color-surface)] border-y border-[var(--color-border-light)] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[var(--color-text-subtle)] mb-4">
          Trusted by candidates preparing for:
        </p>
        <div className="overflow-x-auto">
          <div className="flex gap-3 flex-nowrap justify-start md:justify-center pb-2">
            {COMPANIES.map((company) => (
              <span
                key={company}
                className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofStrip;
