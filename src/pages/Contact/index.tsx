import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';
import ContactForm from './components/ContactForm';
import ContactInfo from './components/ContactInfo';
import FaqList from './components/FaqList';

const contactInfo = [
  { icon: Mail, title: 'Email Us', details: 'support@interviewsta.com', description: 'Get a response within 24 hours' },
  { icon: Phone, title: 'Call Us', details: '7340899959', description: 'Mon–Fri 9am–6pm IST' },
];

const faqs = [
  { question: 'How do I get started?', answer: 'Create an account and choose from our AI-powered interview options. You can start practicing immediately.' },
  { question: 'What types of interviews can I practice?', answer: 'We offer technical, behavioral, and senior role interviews across various industries.' },
  { question: 'Is there a free trial?', answer: 'Yes. We offer a free trial with access to key features. No credit card required.' },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Contact us</h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Have questions? We’re here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Get in touch</h2>
            <ContactInfo items={contactInfo} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Send a message</h2>
            <ContactForm />
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">FAQs</h2>
          <FaqList items={faqs} />
        </section>

        <div className="mt-10 text-center">
          <Link to={ROUTES.HOME} className="text-blue-600 hover:underline font-medium">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
