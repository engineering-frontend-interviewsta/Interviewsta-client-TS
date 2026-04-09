import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useCountUp } from './useCountUp';

interface StatItem {
  target: number | string;
  suffix?: string;
  label: string;
  isNumeric: boolean;
}

const STATS: StatItem[] = [
  { target: 10000, suffix: '+', label: 'Interview Questions', isNumeric: true },
  { target: 9, suffix: '+', label: 'Interview Categories', isNumeric: true },
  { target: 20, suffix: '+', label: 'Company Tracks', isNumeric: true },
  { target: '24/7', label: 'AI Availability', isNumeric: false },
];

interface NumericCounterProps {
  target: number;
  suffix?: string;
  inView: boolean;
}

const NumericCounter: React.FC<NumericCounterProps> = ({ target, suffix, inView }) => {
  const count = useCountUp(target, 2000, inView);
  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-[#3b0764] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`text-center py-8 px-4 ${
                index < STATS.length - 1 ? 'border-r border-white/20' : ''
              }`}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.isNumeric ? (
                  <NumericCounter
                    target={stat.target as number}
                    suffix={stat.suffix}
                    inView={inView}
                  />
                ) : (
                  <span>{stat.target}</span>
                )}
              </div>
              <div className="text-white/70 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default StatsSection;
