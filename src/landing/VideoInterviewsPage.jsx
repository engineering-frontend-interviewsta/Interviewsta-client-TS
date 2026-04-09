import React from 'react';
import { motion } from 'framer-motion';
import {
  Play, Bot, Video, MessageCircle, BarChart, CheckCircle, Sparkles, ArrowRight,
  Briefcase, Building2, BookOpen, Users
} from 'lucide-react';
import { ALL_INTERVIEW_OPTIONS } from '../data/interviewTypesData';

// Company library: filter company-wise entries
const COMPANY_LIBRARY = ALL_INTERVIEW_OPTIONS.filter(
  (item) => item.category === 'company-wise'
);

// Consulting frameworks
const CONSULTING_TOPICS = [
  {
    name: 'Profitability',
    description: 'Diagnose revenue and cost drivers to identify profit improvement levers.',
  },
  {
    name: 'Market Entry',
    description: 'Evaluate attractiveness and feasibility of entering a new market or geography.',
  },
  {
    name: 'Growth Strategy',
    description: 'Identify organic and inorganic growth opportunities for a business.',
  },
  {
    name: 'M&A',
    description: 'Assess strategic fit, synergies, and integration risks of mergers and acquisitions.',
  },
  {
    name: 'Operations & Cost',
    description: 'Streamline operations and reduce costs without sacrificing quality or output.',
  },
  {
    name: 'Pricing Strategy',
    description: 'Determine optimal pricing models to maximize revenue and market share.',
  },
  {
    name: 'Product & Innovation',
    description: 'Evaluate product-market fit and build innovation pipelines for growth.',
  },
  {
    name: 'Turnaround & Crisis',
    description: 'Stabilize and revive a distressed business through rapid structural changes.',
  },
];

// Indian startup growth stories
const GROWTH_STORIES = [
  {
    company: 'Zomato',
    tagline: 'Food Delivery Disruption',
    description: 'Transformed India\'s fragmented restaurant industry into a unified digital food delivery ecosystem serving 800+ cities.',
  },
  {
    company: 'Swiggy',
    tagline: 'Hyperlocal Logistics',
    description: 'Built a last-mile delivery network that redefined speed and reliability for food and grocery delivery across India.',
  },
  {
    company: 'CRED',
    tagline: 'Premium Fintech',
    description: 'Created an exclusive rewards platform for creditworthy Indians, turning bill payments into a premium lifestyle experience.',
  },
  {
    company: 'Meesho',
    tagline: 'Social Commerce',
    description: 'Empowered millions of micro-entrepreneurs to sell online via WhatsApp and social networks, democratizing e-commerce.',
  },
  {
    company: 'Zepto',
    tagline: 'Quick Commerce',
    description: 'Pioneered 10-minute grocery delivery in India through a dense dark-store network and hyper-optimized logistics.',
  },
  {
    company: "Byju's",
    tagline: 'EdTech Revolution',
    description: 'Became the world\'s most valued edtech company by making personalized learning accessible to students across India.',
  },
  {
    company: 'Ola',
    tagline: 'Mobility Platform',
    description: 'Disrupted urban transportation by aggregating auto-rickshaws, cabs, and bikes into a single super-app for mobility.',
  },
  {
    company: 'Flipkart',
    tagline: 'E-commerce Pioneer',
    description: 'Built India\'s first homegrown e-commerce giant, pioneering cash-on-delivery and logistics innovation for Bharat.',
  },
];

// Sample Glee conversation
const GLEE_CONVERSATION = [
  {
    role: 'ai',
    text: "Hi! I'm Glee, your AI interviewer. Let's start with a classic — tell me about yourself and what you're looking for in your next role.",
  },
  {
    role: 'user',
    text: "Sure! I'm a software engineer with 3 years of experience in React and Node.js. I'm looking for a senior role where I can lead frontend architecture.",
  },
  {
    role: 'ai',
    text: "Great background! Can you walk me through a challenging technical problem you solved recently? I'd love to hear about your approach.",
  },
  {
    role: 'user',
    text: "Absolutely. We had a performance bottleneck in our dashboard — I profiled the renders, identified unnecessary re-renders, and used React.memo and useMemo to cut load time by 60%.",
  },
];

const difficultyColor = (difficulty) => {
  if (difficulty === 'Easy') return 'bg-green-100 text-green-700';
  if (difficulty === 'Hard') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
};

const VideoInterviewsPage = () => {
  const features = [
    {
      icon: Bot,
      title: 'Meet Glee',
      description: 'Practice with our advanced AI interviewer who adapts to your responses in real-time',
      details: ['Natural conversation flow', 'Contextual follow-up questions', 'Industry-specific scenarios'],
    },
    {
      icon: Video,
      title: 'Realistic Experience',
      description: 'Full video interview simulation that mirrors actual interview conditions',
      details: ['Live video feed', 'Camera and audio controls', 'Professional interface'],
    },
    {
      icon: MessageCircle,
      title: 'Dynamic Questions',
      description: 'Questions adapt based on your role, experience level, and previous responses',
      details: ['Technical deep-dives', 'Behavioral scenarios', 'Leadership challenges'],
    },
    {
      icon: BarChart,
      title: 'Instant Feedback',
      description: 'Get detailed analysis of your performance immediately after the interview',
      details: ['Communication assessment', 'Technical evaluation', 'Improvement suggestions'],
    },
  ];

  const interviewTypes = [
    {
      title: 'Technical Interviews',
      description: 'Perfect for software engineers, data scientists, and tech roles',
      duration: '45 minutes',
      features: ['Coding challenges', 'System design', 'Algorithm questions', 'Live code editor'],
    },
    {
      title: 'Behavioral Interviews',
      description: 'Master the art of telling your story and demonstrating soft skills',
      duration: '30 minutes',
      features: ['STAR method practice', 'Situational questions', 'Cultural fit assessment', 'Leadership scenarios'],
    },
    {
      title: 'Senior Role Interviews',
      description: 'Prepare for executive and leadership positions',
      duration: '60 minutes',
      features: ['Strategic thinking', 'Team management', 'Vision and planning', 'Stakeholder communication'],
    },
  ];

  const benefits = [
    'Practice unlimited times without judgment',
    'Get feedback you can act on immediately',
    'Build confidence before the real interview',
    'Learn from detailed performance analytics',
    'Save time and money on interview coaches',
    'Access anytime, anywhere, 24/7',
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Choose Type',
      description: 'Select from technical, behavioral, case study, or company-specific interviews',
    },
    {
      step: '2',
      title: 'Configure Session',
      description: 'Set your role, experience level, and target company to personalize the session',
    },
    {
      step: '3',
      title: 'Meet Glee',
      description: 'Start your interview with Glee, your AI coach who conducts a natural conversation',
    },
    {
      step: '4',
      title: 'Get Feedback',
      description: 'Receive detailed scores, strengths, and actionable areas to improve',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] rounded-full px-6 py-2 mb-6">
            <Play className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-[var(--color-primary)] font-medium">AI Video Interviews</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
            Practice Interviews with
            <span className="block text-[var(--color-primary)]">Glee, Your AI Coach</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed mb-8">
            Experience realistic AI-powered video interviews that adapt to your responses.
            Get instant feedback and improve your interview skills at your own pace.
          </p>
          <a href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Your First Interview</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </a>
        </motion.div>

        {/* Mock Glee Conversation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-4">See Glee in Action</h2>
          <p className="text-[var(--color-text-muted)] text-center mb-10 text-lg">A sample conversation with your AI interviewer</p>
          <div className="max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-6 shadow-md space-y-4">
            {GLEE_CONVERSATION.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'ai'
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-tl-sm'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-text)] rounded-tr-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <span className="block text-xs font-semibold mb-1 opacity-70">Glee · AI Interviewer</span>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-8 shadow-md"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[var(--color-text)] mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-[var(--color-text-muted)]">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interview Types */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Interview Types</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {interviewTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-8 shadow-md"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">{type.title}</h3>
                  <p className="text-[var(--color-text-muted)] mb-3">{type.description}</p>
                  <div className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-medium">
                    {type.duration}
                  </div>
                </div>
                <div className="border-t border-[var(--color-border-light)] pt-4 mt-4">
                  <ul className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-[var(--color-text-muted)]">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Library */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] rounded-full px-5 py-2 mb-4">
              <Building2 className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-[var(--color-primary)] text-sm font-medium">Company Library</span>
            </div>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">Practice for Top Companies</h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
              Company-specific interview tracks with real-world questions and scenarios
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COMPANY_LIBRARY.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[var(--color-text)] text-sm">{company.company || company.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(company.difficulty)}`}>
                    {company.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(company.topics || []).slice(0, 2).map((topic, ti) => (
                    <span
                      key={ti}
                      className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-0.5 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Consulting Topics */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] rounded-full px-5 py-2 mb-4">
              <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-[var(--color-primary)] text-sm font-medium">Consulting Tracks</span>
            </div>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">Consulting Interview Frameworks</h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
              Master the 8 core consulting frameworks used in McKinsey, BCG, and Bain interviews
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {CONSULTING_TOPICS.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-5 shadow-sm"
              >
                <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center mb-3">
                  <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">{topic.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{topic.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Growth Stories */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] rounded-full px-5 py-2 mb-4">
              <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-[var(--color-primary)] text-sm font-medium">Growth Stories</span>
            </div>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">Indian Startup Case Studies</h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
              Learn from the journeys of India's most iconic startups
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {GROWTH_STORIES.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-5 shadow-sm"
              >
                <h3 className="font-bold text-[var(--color-text)] text-lg mb-1">{story.company}</h3>
                <span className="inline-block text-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-0.5 rounded-full mb-3 font-medium">
                  {story.tagline}
                </span>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{story.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{item.title}</h3>
                <p className="text-[var(--color-text-muted)]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-8 md:p-12 mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Why Choose AI Video Interviews?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-[var(--color-text)] text-lg">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-2xl p-12 text-center text-white"
        >
          <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Interview?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their interview skills with Glee.
            Start practicing today!
          </p>
          <a href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Begin Practice Interview</span>
            </motion.button>
          </a>
        </motion.div>

      </div>
    </div>
  );
};

export default VideoInterviewsPage;
