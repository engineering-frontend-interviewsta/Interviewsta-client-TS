import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, TrendingUp, Target, Calendar, Award, Clock, CheckCircle, Zap, Brain, ArrowRight } from 'lucide-react';

const LandingDashboard = () => {
  const features = [
    { icon: BarChart3, title: 'Performance Analytics', description: 'Track your progress with detailed charts and metrics showing improvement over time', details: ['Interview scores by category', 'Skill progression graphs', 'Time-based trends', 'Comparative benchmarks'] },
    { icon: Target, title: 'Personalized Goals', description: 'Set and track custom goals tailored to your interview preparation journey', details: ['Custom milestones', 'Progress tracking', 'Achievement badges', 'Deadline reminders'] },
    { icon: Calendar, title: 'Session History', description: 'Review all your practice sessions with complete transcripts and feedback', details: ['Full interview recordings', 'Detailed transcripts', 'AI feedback reports', 'Performance comparisons'] },
    { icon: Brain, title: 'AI Recommendations', description: 'Get personalized suggestions from Glee on what to practice next', details: ['Weak area identification', 'Targeted practice plans', 'Resource recommendations', 'Learning paths'] },
    { icon: Award, title: 'Achievements', description: 'Earn badges and certifications as you master different interview skills', details: ['Skill certifications', 'Milestone badges', 'Completion streaks', 'Leaderboard rankings'] },
    { icon: Clock, title: 'Study Plans', description: 'Follow structured learning paths designed to prepare you for specific roles', details: ['Role-specific curricula', 'Daily practice schedules', 'Progress checkpoints', 'Adaptive difficulty'] }
  ];
  const dashboardSections = [
    { title: 'Overview', description: "Get a bird's eye view of your preparation progress with key metrics at a glance", metrics: ['Total practice hours', 'Interviews completed', 'Current skill level', 'Upcoming sessions'] },
    { title: 'Recent Activity', description: 'Quick access to your most recent practice sessions and feedback', metrics: ['Last interview date', 'Recent improvements', 'Pending reviews', 'Action items'] },
    { title: 'Skill Assessment', description: 'Detailed breakdown of your strengths and areas for improvement across all categories', metrics: ['Technical skills', 'Communication', 'Problem solving', 'Behavioral responses'] },
    { title: 'Upcoming Interviews', description: 'Keep track of scheduled practice sessions and real interview dates', metrics: ['Practice calendar', 'Interview prep checklist', 'Time remaining', 'Readiness score'] }
  ];
  const benefits = ['All your practice sessions in one centralized location', 'Visual progress tracking with intuitive charts', 'Personalized insights from Glee, your AI coach', 'Quick access to all interview preparation tools', 'Performance comparisons across multiple sessions', 'Export reports for offline review'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-6 py-2 mb-6"><LayoutDashboard className="h-5 w-5 text-blue-600" /><span className="text-blue-600 font-medium">Dashboard</span></div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Your Command Center for <span className="block text-blue-600">Interview Success</span></h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">Track your progress, analyze performance, and get personalized insights all in one powerful dashboard designed to accelerate your interview preparation.</p>
          <Link to="/login"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"><LayoutDashboard className="h-5 w-5" /><span>Go to Dashboard</span><ArrowRight className="h-5 w-5" /></motion.button></Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Dashboard Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5 }} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4"><feature.icon className="h-7 w-7 text-white" /></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">{feature.details.map((detail, idx) => (<li key={idx} className="flex items-center text-gray-700"><CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm">{detail}</span></li>))}</ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 mb-20 border border-blue-100">
          <div className="text-center mb-12"><Zap className="h-16 w-16 text-blue-600 mx-auto mb-4" /><h2 className="text-4xl font-bold text-gray-900 mb-4">Dashboard Sections</h2><p className="text-xl text-gray-600 max-w-2xl mx-auto">Your dashboard is organized into intuitive sections for easy navigation</p></div>
          <div className="grid md:grid-cols-2 gap-8">
            {dashboardSections.map((section, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h3><p className="text-gray-600 mb-4">{section.description}</p>
                <div className="space-y-2">{section.metrics.map((metric, idx) => (<div key={idx} className="flex items-center text-gray-700"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div><span className="text-sm">{metric}</span></div>))}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Use the Dashboard?</h2>
          <div className="grid md:grid-cols-2 gap-6">{benefits.map((benefit, index) => (<motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }} viewport={{ once: true }} className="flex items-start space-x-3"><TrendingUp className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" /><p className="text-gray-700 text-lg">{benefit}</p></motion.div>))}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <LayoutDashboard className="h-16 w-16 mx-auto mb-6 opacity-90" /><h2 className="text-4xl font-bold mb-4">Start Tracking Your Progress</h2><p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">Access your personalized dashboard now and take control of your interview preparation journey.</p>
          <Link to="/login"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"><LayoutDashboard className="h-5 w-5" /><span>Open Dashboard</span></motion.button></Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingDashboard;
