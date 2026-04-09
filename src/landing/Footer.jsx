import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Instagram, Mail } from 'lucide-react';
import logoDark from '../assets/logoDark.png';

const MotionLink = motion(Link);

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

const productLinks = [
  { name: 'Video Interviews', to: '/video-interviews' },
  { name: 'Resume Analysis', to: '/resume' },
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Pricing', to: '/pricing' },
];

const companyLinks = [
  { name: 'About Us', to: '/about' },
  { name: 'Contact', to: '/contact' },
  { name: 'Blog', to: '#' },
  { name: 'Careers', to: '#' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const Footer = () => {
  return (
    <footer className="bg-[#1e0a3c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Column 1 – Brand */}
          <motion.div {...fadeUp(0)}>
            <Link to="/" className="inline-block mb-5">
              <img src={logoDark} alt="Interviewsta.AI" className="h-8 w-auto" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              AI-powered interview preparation that helps you land the job you deserve.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60
                             hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2 – Product */}
          <motion.div {...fadeUp(0.1)}>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Product</h4>
            <ul className="space-y-3">
              {productLinks.map(({ name, to }) => (
                <li key={name}>
                  <Link
                    to={to}
                    className="text-white/60 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3 – Company */}
          <motion.div {...fadeUp(0.2)}>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map(({ name, to }) => (
                <li key={name}>
                  <Link
                    to={to}
                    className="text-white/60 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4 – Support */}
          <motion.div {...fadeUp(0.3)}>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Support</h4>
            <div className="space-y-4">
              <a
                href="mailto:support@interviewsta.ai"
                className="flex items-center gap-2 text-white/60 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150"
              >
                <Mail className="h-4 w-4 shrink-0" />
                support@interviewsta.ai
              </a>
              <ul className="space-y-3 mt-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-white/60 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-white/60 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 Interviewsta.AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-white/40 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150">
              Privacy
            </Link>
            <Link to="/terms" className="text-white/40 text-sm hover:text-[var(--color-primary-light)] transition-colors duration-150">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
