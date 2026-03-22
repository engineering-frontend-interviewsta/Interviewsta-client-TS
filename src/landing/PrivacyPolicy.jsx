import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Database, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Personal information you provide (name, email, professional details)',
        'Interview session data and performance metrics',
        'Resume content for analysis purposes',
        'Usage data and interaction patterns',
        'Technical information (IP address, browser type, device information)'
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        'Provide and improve our AI-powered interview services',
        'Personalize your experience and recommendations',
        'Analyze performance and generate feedback reports',
        'Communicate important updates and support',
        'Ensure platform security and prevent fraud'
      ]
    },
    {
      icon: Shield,
      title: 'Data Protection',
      content: [
        'Industry-standard encryption for data transmission and storage',
        'Regular security audits and penetration testing',
        'Access controls and authentication measures',
        'Secure data centers with 24/7 monitoring',
        'Regular backups and disaster recovery procedures'
      ]
    },
    {
      icon: Eye,
      title: 'Data Sharing',
      content: [
        'We never sell your personal information to third parties',
        'Data shared with service providers under strict agreements',
        'Anonymized data may be used for research and improvements',
        'Legal compliance when required by law',
        'With your explicit consent for specific purposes'
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        'Access your personal data at any time',
        'Request correction of inaccurate information',
        'Delete your account and associated data',
        'Export your data in a portable format',
        'Opt-out of marketing communications',
        'Object to certain data processing activities'
      ]
    },
    {
      icon: FileText,
      title: 'Data Retention',
      content: [
        'Active account data retained while account is active',
        'Interview recordings stored for 90 days by default',
        'Anonymized analytics data retained for service improvement',
        'Deleted account data removed within 30 days',
        'Legal compliance may require longer retention periods'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-6 py-2 mb-6">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Privacy Policy</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Privacy <span className="text-blue-600">Matters</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: November 2, 2025
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <p className="text-gray-700 leading-relaxed">
            At Interviewsta.AI, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, protect, and share your personal information when you use our AI-powered interview
            preparation platform. By using our services, you agree to the collection and use of information
            in accordance with this policy.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-12 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Contact Us About Privacy</h2>
          <p className="mb-4 opacity-90">
            If you have any questions or concerns about our privacy practices, please don't hesitate to contact us:
          </p>
          <div className="space-y-2 opacity-90">
            <p>Email: privacy@Interviewsta.AI.com</p>
            <p>Address: 123 Innovation Drive, San Francisco, CA 94105</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-gray-600 text-sm"
        >
          <p>
            We reserve the right to update this Privacy Policy at any time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
