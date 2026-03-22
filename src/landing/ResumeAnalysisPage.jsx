import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, TrendingUp, Target, Sparkles, Search, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Search,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with keyword analysis and formatting suggestions'
    },
    {
      icon: Target,
      title: 'Content Review',
      description: 'Get feedback on your achievements, experience descriptions, and overall narrative'
    },
    {
      icon: Award,
      title: 'Impact Analysis',
      description: 'Learn how to quantify achievements and demonstrate your value to potential employers'
    },
    {
      icon: TrendingUp,
      title: 'Industry Alignment',
      description: 'Tailor your resume to match industry standards and role-specific requirements'
    }
  ];

  const analysisAreas = [
    'Keyword optimization for ATS systems',
    'Formatting and visual hierarchy',
    'Action verb usage and impact statements',
    'Quantifiable achievements and metrics',
    'Skills section relevance',
    'Experience description clarity',
    'Education and certifications placement',
    'Overall length and content balance'
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
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Resume Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get AI-Powered
            <span className="block text-blue-600">Resume Feedback</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Our advanced AI analyzes your resume to help you stand out, pass ATS systems,
            and land more interviews.
          </p>
          <a href='/login'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/resume-analysis')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>Analyze Your Resume</span>
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
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">What We Analyze</h2>
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
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Comprehensive Analysis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {analysisAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-gray-700 text-lg">{area}</p>
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
          <h2 className="text-4xl font-bold mb-4">Ready to Improve Your Resume?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get instant, actionable feedback to make your resume stand out and land more interviews.
          </p>
          <a href='/login'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/resume-analysis')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>Upload Your Resume</span>
          </motion.button>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
