import React from 'react';
import { motion } from 'framer-motion';
import { Play, Bot, Video, MessageCircle, BarChart, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';


const VideoInterviewsPage = () => {
  const features = [
    {
      icon: Bot,
      title: 'Meet Glee',
      description: 'Practice with our advanced AI interviewer who adapts to your responses in real-time',
      details: ['Natural conversation flow', 'Contextual follow-up questions', 'Industry-specific scenarios']
    },
    {
      icon: Video,
      title: 'Realistic Experience',
      description: 'Full video interview simulation that mirrors actual interview conditions',
      details: ['Live video feed', 'Camera and audio controls', 'Professional interface']
    },
    {
      icon: MessageCircle,
      title: 'Dynamic Questions',
      description: 'Questions adapt based on your role, experience level, and previous responses',
      details: ['Technical deep-dives', 'Behavioral scenarios', 'Leadership challenges']
    },
    {
      icon: BarChart,
      title: 'Instant Feedback',
      description: 'Get detailed analysis of your performance immediately after the interview',
      details: ['Communication assessment', 'Technical evaluation', 'Improvement suggestions']
    }
  ];

  const interviewTypes = [
    {
      title: 'Technical Interviews',
      description: 'Perfect for software engineers, data scientists, and tech roles',
      duration: '45 minutes',
      features: ['Coding challenges', 'System design', 'Algorithm questions', 'Live code editor']
    },
    {
      title: 'Behavioral Interviews',
      description: 'Master the art of telling your story and demonstrating soft skills',
      duration: '30 minutes',
      features: ['STAR method practice', 'Situational questions', 'Cultural fit assessment', 'Leadership scenarios']
    },
    {
      title: 'Senior Role Interviews',
      description: 'Prepare for executive and leadership positions',
      duration: '60 minutes',
      features: ['Strategic thinking', 'Team management', 'Vision and planning', 'Stakeholder communication']
    }
  ];

  const benefits = [
    'Practice unlimited times without judgment',
    'Get feedback you can act on immediately',
    'Build confidence before the real interview',
    'Learn from detailed performance analytics',
    'Save time and money on interview coaches',
    'Access anytime, anywhere, 24/7'
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Choose Your Interview Type',
      description: 'Select from technical, behavioral, or senior role interviews based on your needs'
    },
    {
      step: '2',
      title: 'Set Up Your Session',
      description: 'Provide context like job description, company, and technologies to practice'
    },
    {
      step: '3',
      title: 'Meet Glee',
      description: 'Start your interview with our AI interviewer who will conduct a natural conversation'
    },
    {
      step: '4',
      title: 'Get Instant Feedback',
      description: 'Receive detailed analysis with scores, strengths, and areas to improve'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-6 py-2 mb-6">
            <Play className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">AI Video Interviews</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Practice Interviews with
            <span className="block text-blue-600">Glee, Your AI Coach</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Experience realistic AI-powered video interviews that adapt to your responses.
            Get instant feedback and improve your interview skills at your own pace.
          </p>
          <a href='/login'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>Start Your First Interview</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Interview Types</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {interviewTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-3">{type.description}</p>
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {type.duration}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <ul className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose AI Video Interviews?</h2>
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
                <p className="text-gray-700 text-lg">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white"
        >
          <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Interview?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their interview skills with Glee.
            Start practicing today!
          </p>
          <a href='/login'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
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
