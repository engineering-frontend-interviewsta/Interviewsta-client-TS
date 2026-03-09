import { FileCheck, Scale, UserX, Shield, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';
import TermsSection from './components/TermsSection';

const sections = [
  {
    icon: UserX,
    title: 'Acceptance of Terms',
    items: [
      'By accessing and using Interviewsta, you accept and agree to be bound by these Terms of Service.',
      'If you do not agree, please do not use our services.',
      'We reserve the right to modify these terms at any time.',
      'Continued use after changes constitutes acceptance of modified terms.',
    ],
  },
  {
    icon: FileCheck,
    title: 'Use of Service',
    items: [
      'You must be at least 18 years old to use our services.',
      'You are responsible for maintaining the security of your account.',
      'One account per person; sharing accounts is prohibited.',
      'You agree to provide accurate and complete information.',
      'You will not use the service for any illegal purposes.',
    ],
  },
  {
    icon: Scale,
    title: 'User Responsibilities',
    items: [
      'Maintain confidentiality of your account credentials.',
      'Notify us immediately of any unauthorized access.',
      'Use the platform only for legitimate interview preparation.',
      'Respect intellectual property rights.',
      'Do not attempt to reverse engineer or copy our AI technology.',
    ],
  },
  {
    icon: Shield,
    title: 'Intellectual Property',
    items: [
      'All content, features, and functionality are owned by Interviewsta.',
      'Our AI technology, including Glee, is protected by intellectual property laws.',
      'You retain ownership of content you upload (resumes, responses).',
      'We have a license to use your content to provide and improve services.',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Subscription and Billing',
    items: [
      'Subscription fees are billed in advance on a recurring basis.',
      'You authorize us to charge your payment method.',
      'Refunds are provided according to our refund policy.',
      'You can cancel your subscription at any time.',
      'Cancellation takes effect at the end of the current billing period.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
        <p className="text-neutral-600 text-sm mb-10">Last updated: 2025</p>

        {sections.map((section) => (
          <TermsSection key={section.title} {...section} />
        ))}

        <div className="mt-8">
          <Link to={ROUTES.HOME} className="text-blue-600 hover:underline font-medium">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
