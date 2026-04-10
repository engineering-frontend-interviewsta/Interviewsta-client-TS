import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, MessageSquare, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipient = 'aryankhannachd@gmail.com';
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`
    );
    
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@interviewsta.com',
      description: 'Get a response within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '7340899959',
      description: 'Mon-Fri from 9am to 6pm IST'
    },
    // {
    //   icon: MapPin,
    //   title: 'Visit Us',
    //   details: '123 Innovation Drive, San Francisco, CA 94105',
    //   description: 'Schedule an appointment first'
    // }
  ];

  const faqs = [
    {
      question: 'How do I get started?',
      answer: 'Simply create an account and choose from our AI-powered interview options. You can start practicing immediately!'
    },
    {
      question: 'What types of interviews can I practice?',
      answer: 'We offer technical interviews, behavioral interviews, and senior role interviews across various industries.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 7-day free trial with access to all features. No credit card required.'
    },
    {
      question: 'How does the AI interviewer work?',
      answer: 'Glee, our AI interviewer, uses advanced NLP to conduct realistic conversations, adapting questions based on your responses.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] rounded-full px-6 py-2 mb-6">
            <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-[var(--color-primary)] font-medium">Contact Us</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
            We're Here to <span className="text-[var(--color-primary)]">Help</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
            Have a question or need support? Our team is ready to assist you on your interview preparation journey.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-8 shadow-md text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-xl flex items-center justify-center mx-auto mb-4">
                <info.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{info.title}</h3>
              <p className="text-[var(--color-primary)] font-medium mb-2">{info.details}</p>
              <p className="text-[var(--color-text-muted)] text-sm">{info.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-1 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-md p-8"
          >
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6">Send Us a Message</h2>
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-[var(--color-text)] mb-2">Message Sent!</h3>
                <p className="text-[var(--color-text-muted)]">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Subject</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-lg text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Product Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Monday - Friday</span>
                  <span className="text-gray-600">9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Saturday</span>
                  <span className="text-gray-600">10:00 AM - 4:00 PM IST</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700 font-medium">Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Immediate Help?</h2>
              <p className="text-gray-600 mb-6">
                Check out our comprehensive help center with guides, tutorials, and FAQs to get answers instantly.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full"
              >
                Visit Help Center
              </motion.button>
            </div>
          </motion.div> */}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-md p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-[var(--color-text)] text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border-l-4 border-[var(--color-primary)] pl-6"
              >
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{faq.question}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
