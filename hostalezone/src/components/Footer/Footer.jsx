// Footer.jsx
import React from 'react';
import { 
  HomeIcon,
  InformationCircleIcon,
  CogIcon,
  PhoneIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  MapPinIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaWhatsapp,
  FaTwitter,
  FaYoutube 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      
      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex flex-col space-y-6">
              {/* Enhanced Logo with Gradient */}
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-white border-4 border-white">
                    <div className="flex items-center justify-center w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                      <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    HOSTEL
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                      EZONE
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Smart Living Solutions
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-800">
                  "Safe & Smart Hostel Management Platform"
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Revolutionizing hostel management with cutting-edge technology 
                  and unparalleled security for students and administrators.
                </p>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <h3 className="text-gray-700 font-semibold mb-4">Connect With Us</h3>
                <div className="flex flex-wrap gap-3">
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                    <FaFacebookF className="text-lg" />
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                    <FaInstagram className="text-lg" />
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                    <FaTwitter className="text-lg" />
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                    <FaLinkedinIn className="text-lg" />
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                    <FaYoutube className="text-lg" />
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                    <FaWhatsapp className="text-lg" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
                { name: 'About Us', icon: <InformationCircleIcon className="w-5 h-5" /> },
                { name: 'Our Services', icon: <CogIcon className="w-5 h-5" /> },
                { name: 'Hostel Rooms', icon: <ShieldCheckIcon className="w-5 h-5" /> },
                { name: 'Contact Us', icon: <PhoneIcon className="w-5 h-5" /> },
                { name: 'Login / Register', icon: <UserCircleIcon className="w-5 h-5" /> }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
                  >
                    <span className="text-blue-500 group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium group-hover:translate-x-2 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Contact Info
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-3 group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Our Location</h4>
                  <p className="text-gray-600 mt-1">
                    University Hostel Complex,<br />
                    Academic City,<br />
                    Colombo 07, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Phone Number</h4>
                  <p className="text-gray-600 mt-1">
                    <a href="tel:+94112345678" className="hover:text-blue-600 transition-colors">
                      +94 112 345 678
                    </a><br />
                    <a href="tel:+94771234567" className="hover:text-blue-600 transition-colors">
                      +94 771 234 567 (Emergency)
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                    <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Email Address</h4>
                  <p className="text-gray-600 mt-1">
                    <a href="mailto:info@hostelezone.com" className="hover:text-blue-600 transition-colors">
                      info@hostelezone.com
                    </a><br />
                    <a href="mailto:support@hostelezone.com" className="hover:text-blue-600 transition-colors">
                      support@hostelezone.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Links Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Useful Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Privacy Policy', icon: <ShieldCheckIcon className="w-5 h-5" /> },
                { name: 'Terms & Conditions', icon: <DocumentTextIcon className="w-5 h-5" /> },
                { name: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
                { name: 'Support Center', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
                { name: 'Student Portal', icon: <UserCircleIcon className="w-5 h-5" /> },
                { name: 'Admin Dashboard', icon: <CogIcon className="w-5 h-5" /> }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
                  >
                    <span className="text-blue-500 group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium group-hover:translate-x-2 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter Subscription */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2">Stay Updated</h4>
              <p className="text-sm text-gray-600 mb-3">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg font-medium hover:bg-blue-700 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-600">
                © {new Date().getFullYear()} <span className="font-bold text-blue-600">HostelEZone</span>. 
                All Rights Reserved.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Designed with ❤️ for better student living experiences
              </p>
            </div>

            {/* Extra Badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                🔒 SSL Secured
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                🏆 Trusted Partner
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200">
                ⭐ 4.9/5 Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#3B82F6" fillOpacity="0.1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,138.7C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;