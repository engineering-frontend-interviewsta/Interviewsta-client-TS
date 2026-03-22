import React, {useEffect} from 'react';
import { motion } from 'framer-motion';
import { FileCheck, AlertCircle, Scale, UserX, RefreshCw, Shield } from 'lucide-react';

const TermsOfService = () => {
  
  const sections = [
    {
      icon: UserX,
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using Interviewsta.AI, you accept and agree to be bound by these Terms of Service',
        'If you do not agree to these terms, please do not use our services',
        'We reserve the right to modify these terms at any time',
        'Continued use after changes constitutes acceptance of modified terms'
      ]
    },
    {
      icon: FileCheck,
      title: 'Use of Service',
      content: [
        'You must be at least 18 years old to use our services',
        'You are responsible for maintaining the security of your account',
        'One account per person; sharing accounts is prohibited',
        'You agree to provide accurate and complete information',
        'You will not use the service for any illegal purposes'
      ]
    },
    {
      icon: Scale,
      title: 'User Responsibilities',
      content: [
        'Maintain confidentiality of your account credentials',
        'Notify us immediately of any unauthorized access',
        'Use the platform only for legitimate interview preparation',
        'Respect intellectual property rights',
        'Do not attempt to reverse engineer or copy our AI technology',
        'Behave professionally and respectfully'
      ]
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: [
        'All content, features, and functionality are owned by Interviewsta.AI',
        'Our AI technology, including Glee, is protected by intellectual property laws',
        'You retain ownership of content you upload (resumes, responses)',
        'We have a license to use your content to provide and improve services',
        'Do not copy, distribute, or create derivative works without permission'
      ]
    },
    {
      icon: RefreshCw,
      title: 'Subscription and Billing',
      content: [
        'Subscription fees are billed in advance on a recurring basis',
        'You authorize us to charge your payment method',
        'Refunds are provided according to our refund policy',
        'You can cancel your subscription at any time',
        'Cancellation takes effect at the end of the current billing period',
        'Price changes will be communicated 30 days in advance'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Disclaimers and Limitations',
      content: [
        'Services provided "as is" without warranties of any kind',
        'We do not guarantee interview success or job placement',
        'AI feedback is for educational purposes only',
        'We are not liable for decisions made based on our feedback',
        'Maximum liability limited to fees paid in the last 12 months',
        'We are not responsible for third-party content or services'
      ]
    }
  ];

  const prohibited = [
    'Using the service to train competing AI systems',
    'Sharing or reselling access to your account',
    'Attempting to hack, exploit, or damage the platform',
    'Uploading malicious code or content',
    'Harassing or impersonating others',
    'Scraping or automated data collection',
    'Violating any applicable laws or regulations'
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
            <FileCheck className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Terms of Service</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Terms of <span className="text-blue-600">Service</span>
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
            Welcome to Interviewsta.AI. These Terms of Service govern your use of our AI-powered interview
            preparation platform. Please read these terms carefully before using our services. By creating
            an account or using our platform, you agree to be bound by these terms.
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
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mt-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
          </div>
          <p className="text-gray-700 mb-4">
            The following activities are strictly prohibited and may result in immediate account termination:
          </p>
          <ul className="space-y-3">
            {prohibited.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-12 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Questions About Terms?</h2>
          <p className="mb-4 opacity-90">
            If you have questions about these Terms of Service, please contact our legal team:
          </p>
          <div className="space-y-2 opacity-90">
            <p>Email: aryankhannachd@gmail.com</p>
            {/* <p>Address: 123 Innovation Drive, San Francisco, CA 94105</p> */}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-gray-600 text-sm"
        >
          <p>
            These Terms of Service constitute a legally binding agreement between you and Interviewsta.AI.
            By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
