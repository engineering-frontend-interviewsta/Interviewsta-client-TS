import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Abhishek',
    role: 'Software Engineer',
    company: 'Google',
    content:
      'Interviewsta.ai helped me prepare for DSA interviews in a very short span. I could practice efficiently and gain confidence quickly.',
    rating: 5,
  },
  {
    name: 'Pranav',
    role: 'Student',
    company: 'Stanford University',
    content:
      'Glee guided me patiently to the right answer and encouraged me to think beyond the obvious solutions. Her mentorship made a huge difference.',
    rating: 5,
  },
  {
    name: 'Vansh',
    role: 'Data Scientist',
    company: 'Amazon',
    content:
      'I would recommend Interviewsta.ai to anyone who finds interview scenarios daunting. It builds both skill and confidence.',
    rating: 5,
  },
  {
    name: 'Anushka',
    role: 'Product Manager',
    company: 'Microsoft',
    content:
      'The resume analysis feature of Interviewsta.ai helped me better align my resume to the job requirements. I landed more interview calls after using it.',
    rating: 5,
  },
  {
    name: 'Varun',
    role: 'Frontend Developer',
    company: 'Shopify',
    content:
      'Interviewsta.ai is amazing! The mock interviews, tips, and feedback made me more confident and prepared for real interviews.',
    rating: 5,
  },
  {
    name: 'Ridhi',
    role: 'Intern',
    company: 'Tesla',
    content:
      'The behavioral interview simulations on Interviewsta.ai helped me answer tricky questions with ease and clarity. I feel more ready than ever!',
    rating: 5,
  },
];

const StarRating: React.FC<{ rating: number; white?: boolean }> = ({ rating, white }) => (
  <div className="flex items-center space-x-1">
    {[...Array(rating)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 fill-current ${white ? 'text-yellow-300' : 'text-yellow-400'}`}
      />
    ))}
  </div>
);

const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-[var(--color-surface-alt)] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Feedback
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
            Real Results from Real People
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            Hear from candidates who prepared with Interviewsta.AI
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Large featured card — spans 2 cols */}
          <motion.div
            data-testid="testimonial-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-3xl p-8 shadow-xl relative overflow-hidden cursor-pointer"
          >
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <div className="relative z-10">
              <Quote className="h-12 w-12 text-white/30 mb-6" />
              <p className="text-white text-xl font-medium mb-6 leading-relaxed">
                {TESTIMONIALS[0].content}
              </p>
              <div className="mb-3">
                <p className="text-white font-semibold">{TESTIMONIALS[0].name}</p>
                <p className="text-white/70 text-sm">
                  {TESTIMONIALS[0].role} · {TESTIMONIALS[0].company}
                </p>
              </div>
              <StarRating rating={TESTIMONIALS[0].rating} white />
            </div>
          </motion.div>

          {/* Regular cards */}
          {TESTIMONIALS.slice(1).map((t, index) => (
            <motion.div
              key={t.name}
              data-testid="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="md:col-span-2 lg:col-span-3 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-3xl p-6 shadow-[var(--shadow-md)] relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary-light)] rounded-full blur-2xl opacity-50" />
              <div className="relative z-10">
                <Quote className="h-8 w-8 text-[var(--color-primary-light)] mb-4" />
                <p className="text-[var(--color-text-muted)] text-base mb-5 leading-relaxed">
                  {t.content}
                </p>
                <div className="mb-2">
                  <p className="text-[var(--color-text)] font-semibold text-sm">{t.name}</p>
                  <p className="text-[var(--color-text-subtle)] text-xs">
                    {t.role} · {t.company}
                  </p>
                </div>
                <StarRating rating={t.rating} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
