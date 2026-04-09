import React, { useRef, useEffect } from "react";
import {
  Play,
  Target,
  Bot,
  MessageSquare,
  Brain,
  TrendingUp,
  ArrowRight,
  Award,
  CheckCircle,
  XCircle,
  Clock3,
  Frown,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import HeroSection from "./home/HeroSection";
import SocialProofStrip from "./home/SocialProofStrip";
import InterviewCategoriesSection from "./home/InterviewCategoriesSection";
import StatsSection from "./home/StatsSection";
import TestimonialsSection from "./home/TestimonialsSection";
import FinalCTASection from "./home/FinalCTASection";

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
    link: "/video-interviews",
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
    link: "/resume-analysis",
  },
];

const Home = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay was blocked:", error);
      });
    }
  }, []);

  return (
    <div className="bg-[var(--color-surface-alt)]">
      {/* Hero */}
      <HeroSection />

      {/* Social Proof Strip */}
      <SocialProofStrip />

      {/* Interview Categories */}
      <InterviewCategoriesSection />

      {/* Stats */}
      <StatsSection />

      {/* Meet Glee Section */}
      <div className="bg-gradient-to-br from-[#4c1d95] to-[#3b0764] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/20 text-white rounded-full px-4 py-2 mb-6">
                <Bot className="h-5 w-5 text-white" />
                <span className="font-medium">Meet Your AI Interview Coach</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Say Hello to Glee
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Glee is your personal AI interviewer, designed to provide the most realistic
                interview practice experience. With advanced natural language processing and
                emotional intelligence, Glee adapts to your responses in real-time.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: MessageSquare, text: "Natural, conversational interviews that feel authentic" },
                  { icon: Brain, text: "Learns from your responses to ask better follow-up questions" },
                  { icon: Target, text: "Provides instant, actionable feedback after each session" },
                  { icon: TrendingUp, text: "Tracks your improvement across multiple practice sessions" },
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
                  className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-[var(--radius-xl)] font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center space-x-2"
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
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                {import.meta.env.VITE_VIDEO_SRC1 ? (
                  <video
                    ref={videoRef}
                    src={import.meta.env.VITE_VIDEO_SRC1}
                    className="rounded-2xl w-full"
                    muted
                    autoPlay
                    loop
                    playsInline
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="rounded-2xl w-full aspect-video bg-white/10 flex items-center justify-center">
                    <Bot className="h-24 w-24 text-white/30" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hiring Challenges Timeline Section */}
      <div className="relative py-32 bg-[var(--color-surface-alt)] overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[var(--color-primary-light)] rounded-full"
              style={{
                left: `${(i * 5.3) % 100}%`,
                top: `${(i * 7.1) % 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: (i % 5) * 0.4,
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-xl">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] bg-clip-text text-transparent">
                The Hiring Reality
              </span>
            </h2>
            <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
              Understand the challenges. Overcome them with preparation.
            </p>
          </motion.div>

          {/* Interactive Timeline */}
          <div className="relative">
            {/* Central Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-muted)] transform -translate-x-1/2" />

            <div className="space-y-16">
              {[
                {
                  step: "01",
                  icon: XCircle,
                  title: "Overwhelming Competition",
                  description:
                    "Every job posting receives 250+ applications on average. Standing out requires more than just qualifications — you need to prove your value instantly.",
                  stat: "250:1 ratio",
                  side: "left",
                },
                {
                  step: "02",
                  icon: Clock3,
                  title: "Limited Interview Opportunities",
                  description:
                    "Recruiters spend only 6-7 seconds reviewing each resume. One poorly worded answer can end your chances before you even start.",
                  stat: "7 seconds",
                  side: "right",
                },
                {
                  step: "03",
                  icon: Frown,
                  title: "High Pressure Performance",
                  description:
                    "Interview anxiety affects 93% of candidates. Without practice, nerves can sabotage your performance when it matters most.",
                  stat: "93% affected",
                  side: "left",
                },
                {
                  step: "04",
                  icon: Target,
                  title: "Lack of Feedback",
                  description:
                    "Most candidates never learn why they were rejected. Without actionable feedback, you keep making the same mistakes interview after interview.",
                  stat: "Zero feedback",
                  side: "right",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: item.side === "left" ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative lg:grid lg:grid-cols-2 lg:gap-16 items-center"
                >
                  <div className={`${item.side === "left" ? "lg:text-right" : "lg:order-2"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-[var(--color-surface)] rounded-3xl p-8 shadow-[var(--shadow-lg)] border border-[var(--color-border-light)] relative overflow-hidden group cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-6xl font-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] bg-clip-text text-transparent opacity-20">
                            {item.step}
                          </span>
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                            className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-lg"
                          >
                            <item.icon className="h-8 w-8 text-white" />
                          </motion.div>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                          {item.title}
                        </h3>
                        <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">
                          {item.description}
                        </p>
                        <div className="inline-flex items-center space-x-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-semibold">
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
                      className="w-12 h-12 bg-[var(--color-primary)] rounded-full shadow-2xl flex items-center justify-center"
                    >
                      <div className="w-6 h-6 bg-white rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <div className="inline-block bg-[var(--color-primary)] rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                We Help You Break Through
              </h3>
              <p className="text-white/80 text-lg mb-6 max-w-2xl">
                Don't let these challenges hold you back. Our AI-powered platform gives you the
                practice, feedback, and confidence you need to succeed.
              </p>
              <a href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Start Preparing Today
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Advanced Features Showcase (dark section — intentional design) */}
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
              Every feature designed with precision to accelerate your career growth
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
                    className={`${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}
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
                        className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-2xl flex items-center justify-center shadow-xl"
                        whileHover={{ rotate: 180, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <service.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
                    </motion.div>

                    <h3 className="text-4xl font-bold text-white mb-6">{service.title}</h3>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {service.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                          className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-[var(--color-primary)]/50 transition-all cursor-pointer group"
                        >
                          <CheckCircle className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 group-hover:text-[var(--color-primary-muted)]" />
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
                          boxShadow: "0 0 30px rgba(109, 40, 217, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white px-8 py-4 rounded-[var(--radius-xl)] font-semibold shadow-lg flex items-center space-x-2 group"
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
                    className={`${index % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-3xl blur-3xl opacity-30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      {service.video ? (
                        <video
                          src={service.video}
                          className="relative rounded-3xl border border-white/10 shadow-2xl w-full"
                          muted
                          autoPlay
                          loop
                          playsInline
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div className="relative rounded-3xl border border-white/10 shadow-2xl w-full aspect-video bg-white/5 flex items-center justify-center">
                          <service.icon className="h-24 w-24 text-white/20" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <FinalCTASection />
    </div>
  );
};

export default Home;
