import { Database, Lock, Shield, Eye, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';
import PolicySection from './components/PolicySection';

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    items: [
      'Personal information you provide (name, email, professional details)',
      'Interview session data and performance metrics',
      'Resume content for analysis purposes',
      'Usage data and interaction patterns',
      'Technical information (IP address, browser type, device information)',
    ],
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    items: [
      'Provide and improve our AI-powered interview services',
      'Personalize your experience and recommendations',
      'Analyze performance and generate feedback reports',
      'Communicate important updates and support',
      'Ensure platform security and prevent fraud',
    ],
  },
  {
    icon: Shield,
    title: 'Data Protection',
    items: [
      'Industry-standard encryption for data transmission and storage',
      'Regular security audits and penetration testing',
      'Access controls and authentication measures',
      'Secure data centers with 24/7 monitoring',
      'Regular backups and disaster recovery procedures',
    ],
  },
  {
    icon: Eye,
    title: 'Data Sharing',
    items: [
      'We never sell your personal information to third parties',
      'Data shared with service providers under strict agreements',
      'Anonymized data may be used for research and improvements',
      'Legal compliance when required by law',
      'With your explicit consent for specific purposes',
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    items: [
      'Access your personal data at any time',
      'Request correction of inaccurate information',
      'Delete your account and associated data',
      'Export your data in a portable format',
      'Opt-out of marketing communications',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
        <p className="text-neutral-600 text-sm mb-10">Last updated: 2025</p>

        {sections.map((section) => (
          <PolicySection key={section.title} {...section} />
        ))}

        <p className="text-neutral-500 text-sm">
          For questions about this policy, contact us at{' '}
          <a href="mailto:support@interviewsta.com" className="text-blue-600 hover:underline">
            support@interviewsta.com
          </a>
          .
        </p>
        <div className="mt-8">
          <Link to={ROUTES.HOME} className="text-blue-600 hover:underline font-medium">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
