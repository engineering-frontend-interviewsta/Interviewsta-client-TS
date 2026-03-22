import React from 'react'
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Logo from "../assets/logoDark.png";

const Footer = () => {
  const companyLinks = [{name:'About Us', link:'/about'}, {name:'Careers', link:'/about'}, {name:'Contact', link:'/contact'}];
  const productLinks = [{name:'Video Interviews', link:'/video-interviews'}, {name:'Resume Analysis', link:'/resume-analysis'}, {name:'Dashboard', link:'/dashboard'}];
  // const supportLinks = [{name:'Privacy Policy', link:'/privacy-policy'}, {name:'Terms of Service', link:'/terms-of-service'}];
  return (
    <div>
        <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="flex items-center mb-6">
                <img src={Logo} alt="Interviewsta.AI" className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering professionals worldwide with AI-powered interview preparation tools and personalized coaching.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, index) => (
                  <motion.Link
                    key={index}
                    to="#"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.Link>
                ))}
              </div>
            </motion.div>

            {/* Product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                {productLinks.map((item, index) => (
                  <motion.li key={index} whileHover={{ x: 5 }}>
                    <Link to={item.link} className="text-gray-400 hover:text-white transition-colors">{item.name}</Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((item, index) => (
                  <motion.li key={index} whileHover={{ x: 5 }}>
                    <Link to={item.link} className="text-gray-400 hover:text-white transition-colors">{item.name}</Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              {/* <ul className="space-y-3 mb-6">
                {supportLinks.map((item, index) => (
                  <motion.li key={index} whileHover={{ x: 5 }}>
                    <Link to={item.link} className="text-gray-400 hover:text-white transition-colors">{item.name}</Link>
                  </motion.li>
                ))}
              </ul> */}

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>support@interviewsta.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+91 7340899959</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>Banglore, KA</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 InterviewstaAI. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer