import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Users, Zap, Heart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We exist to help people land their dream jobs through better interview preparation'
    },
    {
      icon: Heart,
      title: 'Empathy First',
      description: 'We understand the stress of interviews and design our tools with compassion'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI to provide the most realistic practice experience'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We build tools that bring people together and celebrate collective success'
    }
  ];

  // const team = [
  //   {
  //     name: 'Amit Aggarwal',
  //     role: 'CEO & Co-Founder',
  //     image: 'Images/Dr. Amit pic.jpeg',
  //     bio: 'AI Research Scientist @ Wells Fargo, PhD in Computer Science from IIT Roorkee. 9+ years of experience in Natural Language Processing (NLP), large language models (LLMs), and speech recognition systems.'
  //   },
  //   {
  //     name: 'Arryuann Khanna',
  //     role: 'Developer & Co-Founder',
  //     image: '/Images/AK_pic.jpeg',
  //     bio: 'AI researcher specializing in natural language processing'
  //   },
  //   // {
  //   //   name: 'Emily Johnson',
  //   //   role: 'Head of Product',
  //   //   image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
  //   //   bio: 'Product leader passionate about education technology'
  //   // },
  //   // {
  //   //   name: 'David Park',
  //   //   role: 'Head of AI',
  //   //   image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
  //   //   bio: 'Machine learning expert from Stanford with 8+ years experience'
  //   // }
  // ];

  const milestones = [
    { year: '2024', title: 'Beginning of the initiative', description: 'Started with a vision to democratize interview prep' },
    { year: 'September, 2025', title: 'Worked on Resume Analysis', description: 'Transformed resume analysis with AI-driven insights' },
    { year: 'October, 2025', title: 'Introduced Glee', description: 'Launched Glee, our revolutionary AI interviewer' },
    // { year: 'November, 2025', title: '50K+ Success Stories', description: 'Helped over 50,000 professionals land their dream jobs' },
    // { year: 'December, 2025', title: 'Global Expansion', description: 'Now serving candidates in over 50 countries worldwide' }
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
            <Brain className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-[var(--color-primary)] font-medium">About Interviewsta.AI</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
            Empowering Careers Through
            <span className="block text-[var(--color-primary)]">AI-Powered Preparation</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
            We're on a mission to help every professional ace their interviews and land their dream jobs
            through cutting-edge AI technology and personalized coaching.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-md p-8 md:p-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6">Our Story</h2>
            <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
              <p>
                Interviewsta.AI was born from a simple observation: interview preparation is broken.
                Traditional methods are expensive, time-consuming, and often don't provide the realistic
                practice candidates need to succeed.
              </p>
              <p>
                Our founders, who have conducted thousands of interviews at top tech companies, realized
                that AI could revolutionize how people prepare. By combining cutting-edge natural language
                processing with deep expertise in recruitment, we created Glee - your personal AI interview coach.
              </p>
              <p>
                Today, we're proud to have helped over 50,000 professionals land jobs at companies like Google,
                Microsoft, Amazon, and thousands of other organizations worldwide. But we're just getting started.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-md"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{value.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="aspect-square overflow-hidden">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-muted)]" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-md">
                      <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{milestone.title}</h3>
                      <p className="text-[var(--color-text-muted)]">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-full border-4 border-[var(--color-surface)] shadow-lg z-10" />
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-2xl p-12 text-center text-white"
        >
          <Globe className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Whether you're a candidate looking to ace your next interview or want to be part of our team,
            we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Practicing
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-white px-8 py-4 rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-[var(--color-primary)] transition-all"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
