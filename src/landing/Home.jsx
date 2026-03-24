import React, { useRef, useEffect } from "react";
import {
  Play,
  Zap,
  Target,
  Bot,
  Rocket,
  Clock,
  MessageSquare,
  Brain,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  Quote,
  Users,
  Award,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  XCircle,
  Clock3,
  Frown,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  // document.body.getClient
  useEffect(() => {
    const rect = carouselRef.current.getBoundingClientRect();
    // console.log('Carousel dimensions:', rect);
  }, []);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn('Autoplay was blocked:', error);
      });
    }
  }, []);
  const features = [
    {
      icon: Play,
      title: "AI Video Interviews",
      description: "Practice with realistic AI-powered interview simulations",
    },
    {
      icon: Target,
      title: "Resume Analysis",
      description: "Get AI-powered feedback on your resume",
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Track your progress with detailed analytics",
    },
  ];

  const companyLogos = [
    { name: "Google", logo: "Images/Google Logo.png" },
    { name: "Microsoft", logo: "https://eodhd.com/img/logos/US/MSFT.png" },
    { name: "Amazon", logo: "Images/Amazon Logo.png" },
    { name: "Meta", logo: "Images/Meta Logo.png" },
    { name: "Apple", logo: "Images/Apple Logo.png" },
    { name: "Netflix", logo: "Images/Netflix Logo.png" },
    // { name: 'Tesla', logo: 'Images/Tesla Logo.png' },
    // { name: 'Spotify', logo: 'Images/Spotify Logo.png' },
    // { name: 'Netflix', logo: 'Images/Netflix Logo.png' },
    // { name: 'Tesla', logo: 'Images/Tesla Logo.png' },
    // { name: 'Spotify', logo: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=100&h=60' }
  ];

  const services = [
    {
      icon: Play,
      title: "AI Video Interviews",
      description:
        "Experience realistic interview scenarios with our advanced AI interviewer that adapts to your responses and provides personalized feedback.",
      features: [
        "Real-time conversation",
        "Behavioral & technical questions",
        "Performance analytics",
        "Industry-specific scenarios",
      ],
      video: import.meta.env.VITE_VIDEO_SRC2,
      link: "/video-interviews"
    },
    {
      icon: TrendingUp,
      title: "Resume Analysis",
      description:
        "Get comprehensive AI-powered analysis of your resume with actionable insights to improve your chances of landing interviews.",
      features: [
        "ATS optimization",
        "Keyword analysis",
        "Format suggestions",
        "Industry alignment",
      ],
      video: import.meta.env.VITE_VIDEO_SRC3,
      link: "/resume-analysis"
    },
    // {
    //   icon: Target,
    //   title: 'Smart Written Tests',
    //   description: 'Take adaptive assessments that adjust difficulty based on your performance, covering technical skills, aptitude, and domain knowledge.',
    //   features: ['Adaptive difficulty', 'Instant feedback', 'Progress tracking', 'Industry benchmarks']
    // },
    // {
    //   icon: Users,
    //   title: 'Personal Coaching',
    //   description: 'Receive one-on-one guidance from our AI coach, tailored to your career goals and interview preparation needs.',
    //   features: ['Personalized tips', '24/7 availability', 'Progress monitoring', 'Goal setting']
    // }
  ];

  const testimonials = [
  {
    name: "Abhishek",
    role: "Software Engineer at Google",
    image:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content:
      "Interviewsta.ai helped me prepare for DSA interviews in a very short span. I could practice efficiently and gain confidence quickly.",
    rating: 5,
  },
  {
    name: "Pranav",
    role: "Student at Stanford University",
    image:
      "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content:
      "Glee guided me patiently to the right answer and encouraged me to think beyond the obvious solutions. Her mentorship made a huge difference.",
    rating: 5,
  },
  {
    name: "Vansh",
    role: "Data Scientist at Amazon",
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content:
      "I would recommend Interviewsta.ai to anyone who finds interview scenarios daunting. It builds both skill and confidence.",
    rating: 5,
  },
  {
    name: "Anushka",
    role: "Product Manager at Microsoft",
    image:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content:
      "The resume analysis feature of Interviewsta.ai helped me better align my resume to the job requirements. I landed more interview calls after using it.",
    rating: 5,
  },
  {
    name: "Varun",
    role: "Frontend Developer at Shopify",
    image:
      "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content:
      "Interviewsta.ai is amazing! The mock interviews, tips, and feedback made me more confident and prepared for real interviews.",
    rating: 5,
  },
  {
    name: "Ridhi",
    role: "Intern at Tesla",
    image:
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content:
      "The behavioral interview simulations on Interviewsta.ai helped me answer tricky questions with ease and clarity. I feel more ready than ever!",
    rating: 5,
  },
];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  const heading1Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const heading2Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, delay: 0.1, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.3 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: index * 0.1 },
    }),
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={badgeVariants}
            className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-100"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-blue-600" />
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 175 }}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
              className="text-sm font-medium text-gray-700 overflow-hidden whitespace-nowrap"
              // layout
            >
              Powered by Empathetic AI
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={heading1Variants}
              className="text-5xl md:text-7xl font-bold"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Master Your
              </span>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={heading2Variants}
              className="text-5xl md:text-7xl font-bold text-gray-900"
            >
              Interview Skills
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Prepare for your dream job with AI-powered interview practice,
              personalized coaching, and comprehensive skill assessments.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a href="/login">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center space-x-2"
              >
              <Play className="h-5 w-5" />
              <span>Start Interview Practice</span>
              <motion.div animate={{ x: 0 }} whileHover={{ x: 5 }}>
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.button>
            </a>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <Link to="/dashboard" className="block text-center">
                View Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16"
          >
            {[
              { number: "2x", label: "Improvements" },
              { number: "95%", label: "Success Rate" },
              { number: "10k+", label: "Interview Questions" },
              { number: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="text-center cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900"
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Meet Glee Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <Bot className="h-5 w-5 text-white" />
                <span className="text-white font-medium">
                  Meet Your AI Interview Coach
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Say Hello to Glee
              </h2>
              <p className="text-xl text-blue-50 mb-8 leading-relaxed">
                Glee is your personal AI interviewer, designed to provide the
                most realistic interview practice experience. With advanced
                natural language processing and emotional intelligence, Glee
                adapts to your responses in real-time, just like a human
                interviewer would.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: MessageSquare,
                    text: "Natural, conversational interviews that feel authentic",
                  },
                  {
                    icon: Brain,
                    text: "Learns from your responses to ask better follow-up questions",
                  },
                  {
                    icon: Target,
                    text: "Provides instant, actionable feedback after each session",
                  },
                  {
                    icon: TrendingUp,
                    text: "Tracks your improvement across multiple practice sessions",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-white text-lg pt-2">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            <a href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Interview with Glee</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 shadow-sm shadow-white">
                <video
                  ref={videoRef}
                  src={import.meta.env.VITE_VIDEO_SRC1}
                  className="rounded-2xl"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hiring Challenges Timeline Section */}
      <div className="relative py-32 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                The Hiring Reality
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Understand the challenges. Overcome them with preparation.
            </p>
          </motion.div>

          {/* Interactive Timeline */}
          <div className="relative">
            {/* Central Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 transform -translate-x-1/2" />

            <div className="space-y-16">
              {[
                {
                  step: "01",
                  icon: XCircle,
                  title: "Overwhelming Competition",
                  description:
                    "Every job posting receives 250+ applications on average. Standing out requires more than just qualifications - you need to prove your value instantly.",
                  stat: "250:1 ratio",
                  color: "from-blue-500 to-cyan-500",
                  side: "left",
                },
                {
                  step: "02",
                  icon: Clock3,
                  title: "Limited Interview Opportunities",
                  description:
                    "Recruiters spend only 6-7 seconds reviewing each resume. One poorly worded answer can end your chances before you even start.",
                  stat: "7 seconds",
                  color: "from-purple-500 to-pink-500",
                  side: "right",
                },
                {
                  step: "03",
                  icon: Frown,
                  title: "High Pressure Performance",
                  description:
                    "Interview anxiety affects 93% of candidates. Without practice, nerves can sabotage your performance when it matters most.",
                  stat: "93% affected",
                  color: "from-indigo-500 to-blue-500",
                  side: "left",
                },
                {
                  step: "04",
                  icon: Target,
                  title: "Lack of Feedback",
                  description:
                    "Most candidates never learn why they were rejected. Without actionable feedback, you keep making the same mistakes interview after interview.",
                  stat: "Zero feedback",
                  color: "from-blue-600 to-purple-600",
                  side: "right",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: item.side === "left" ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-16 items-center`}
                >
                  {/* Left Side */}
                  <div
                    className={`${
                      item.side === "left" ? "lg:text-right" : "lg:order-2"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group cursor-pointer"
                    >
                      {/* Gradient Overlay */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-6xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent opacity-20`}
                          >
                            {item.step}
                          </span>
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                            className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}
                          >
                            <item.icon className="h-8 w-8 text-white" />
                          </motion.div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {item.description}
                        </p>
                        <div
                          className={`inline-flex items-center space-x-2 bg-gradient-to-r ${item.color} text-white px-4 py-2 rounded-full text-sm font-semibold`}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>{item.stat}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-full shadow-2xl flex items-center justify-center`}
                    >
                      <div className="w-6 h-6 bg-white rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                We Help You Break Through
              </h3>
              <p className="text-blue-100 text-lg mb-6 max-w-2xl">
                Don't let these challenges hold you back. Our AI-powered
                platform gives you the practice, feedback, and confidence you
                need to succeed.
              </p>

            <a href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                  Start Preparing Today
                
              </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-12">
            Everything You Need to <span className="text-blue-600">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform provides comprehensive interview preparation tools
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group cursor-pointer"
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 10, scale: 1.2 }}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div> */}

      {/* Advanced Features Showcase */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-32 relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white rounded-full px-6 py-2 text-sm font-semibold border border-white/20">
                <Award className="h-4 w-4" />
                <span>Premium Features</span>
              </div>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Built for Your Success
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Every feature designed with precision to accelerate your career
              growth
            </p>
          </motion.div>

          <div className="space-y-32">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div
                  className={`grid lg:grid-cols-2 gap-16 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content Side */}
                  <motion.div
                    className={`${
                      index % 2 === 1 ? "lg:order-2" : "lg:order-1"
                    }`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="inline-flex items-center space-x-3 mb-6"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
                        whileHover={{ rotate: 180, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <service.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <div className="h-px flex-1 bg-gradient-to-r from-blue-500 to-transparent" />
                    </motion.div>

                    <h3 className="text-4xl font-bold text-white mb-6">
                      {service.title}
                    </h3>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {service.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: featureIndex * 0.1,
                          }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                          className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 group-hover:text-purple-400" />
                          </motion.div>
                          <span className="text-gray-300 group-hover:text-white transition-colors">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  <Link to={service.link}>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 30px rgba(124, 58, 237, 0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center space-x-2 group"
                    >
                      <span>Explore {service.title}</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </motion.button>
                  </Link>
                  </motion.div>

                  {/* Visual Side */}
                  <motion.div
                    className={`${
                      index % 2 === 1 ? "lg:order-1" : "lg:order-2"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      {/* Glowing Effect */}

                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-30"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <video
                        src={service.video}
                        className="relative rounded-3xl border border-white/10 shadow-2xl"
                        muted
                        autoPlay
                      />
                      {/**/}
                      {/* <motion.div
                        className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-8 border border-white/10 shadow-2xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center overflow-hidden relative">
                         
                          <motion.div
                            animate={{
                              y: [0, -15, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                          >
                            <service.icon className="h-24 w-24 text-blue-400/50" />
                          </motion.div>

                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 rounded-full"
                              style={{ background: i % 2 === 0 ? '#3b82f6' : '#a855f7' }}
                              animate={{
                                x: [0, Math.cos(i * 60) * 100, 0],
                                y: [0, Math.sin(i * 60) * 100, 0],
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut"
                              }}
                            />
                          ))}

                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                              viewport={{ once: true }}
                              whileHover={{ scale: 1.05 }}
                              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
                            >
                              <motion.div
                                className="text-2xl font-bold text-white"
                                animate={{ opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                              >
                                {i === 0 ? '99%' : i === 1 ? '24/7' : '10K+'}
                              </motion.div>
                              <div className="text-xs text-gray-400 mt-1">
                                {i === 0 ? 'Accuracy' : i === 1 ? 'Available' : 'Users'}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>  */}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Get Hired at Top Companies Section (temporarily hidden) */}
      {false && <div className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Soft Glowing Accents */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-20"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-2 text-sm font-semibold mb-6 shadow-lg"
            >
              <Rocket className="h-4 w-4" />
              <span>Launch Your Career</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                Get Hired at Top Companies
              </span>
            </h2>
            {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from some of our testers about their experience with the features
            </p> */}
          </motion.div>

          {/* Company Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-sm p-8 shadow-xl border border-gray-200"
          >
            <div
              ref={carouselRef}
              className="flex animate-scroll space-x-6 items-center py-4 w-max"
            >
              {/* <div className="absolute left-[50%] w-2 h-full top-0 bg-black"> </div> */}
              {[
                ...companyLogos,
                ...companyLogos,
                ...companyLogos,
                ...companyLogos,
              ].map((company, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  className="flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer object-contain"
                >
                  {/* <span className="text-gray-700 font-semibold text-sm">{company.name}</span> */}
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-24 h-16 object-contain text-gray-700 font-semibold"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>}

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-2 text-sm font-semibold mb-6 shadow-lg"
            >
              <Star className="h-4 w-4" />
              <span>Feedback</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                Real Results from Real People
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from some of our testers about their experience with the features
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-fr lg:grid-flow-dense">
            {/* Large Card 1 - Sarah */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="md:col-span-2 lg:col-span-3 md:row-span-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-xl relative overflow-hidden group cursor-pointer"
            >
              {/* Floating Orbs */}
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.3, 1], x: [0, -15, 0], y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />

              <div className="relative z-10">
                <Quote className="h-12 w-12 text-white/30 mb-6" />
                <p className="text-white text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  {testimonials[0].content}
                </p>
                <p className="text-white text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  - {testimonials[0].name}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-300 fill-current"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Medium Card 1 - Michael */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group cursor-pointer"
            >
              {/* Gradient Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <Quote className="h-10 w-10 text-blue-500/30 mb-4" />
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {testimonials[1].content}
                </p>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  - {testimonials[1].name}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Medium Card 2 - Emily */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group cursor-pointer"
            >
              {/* Dot Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #8b5cf6 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              <div className="relative z-10">
                <Quote className="h-10 w-10 text-purple-500/30 mb-4" />
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {testimonials[2].content}
                </p>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  - {testimonials[2].name}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

             <div className="lg:col-span-3 md:col-span-2 lg:row-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Medium Card 3 - Emily */} 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group cursor-pointer"
              >
                {/* Gradient Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="relative z-10">
                  <Quote className="h-10 w-10 text-blue-500/30 mb-4" />
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {testimonials[3].content}
                  </p>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    - {testimonials[3].name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Medium Card 4 - Emily */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group cursor-pointer"
              >
                {/* Dot Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #8b5cf6 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <Quote className="h-10 w-10 text-purple-500/30 mb-4" />
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {testimonials[4].content}
                  </p>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    - {testimonials[4].name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Large Card 2 - David */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="md:col-span-2 lg:col-span-3 md:row-span-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-xl relative overflow-hidden group cursor-pointer"
            >
              {/* Animated Grid */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute top-10 right-10 w-20 h-20 border-2 border-white/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-10 left-10 w-16 h-16 border-2 border-white/20 rounded-xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10">
                <Quote className="h-12 w-12 text-white/30 mb-6" />
                <p className="text-white text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  {testimonials[5].content}
                </p>
                <p className="text-white text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  - {testimonials[5].name}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-300 fill-current"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
};

export default Home;
