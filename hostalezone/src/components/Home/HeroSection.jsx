// HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519452639340-94f2ae3c2f6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  ];

  const stats = [
    { number: "98%", label: "Student Satisfaction Rate" },
    { number: "24/7", label: "Security & Support" },
    { number: "5,000+", label: "Happy Residents" },
    { number: "10+", label: "Years Experience" }
  ];

  const features = [
    { icon: "Security", text: "24/7 Security Systems" },
    { icon: "WiFi", text: "High-Speed Internet" },
    { icon: "Study", text: "Study Zones & Library" },
    { icon: "Fitness", text: "Fitness Center" },
    { icon: "Food", text: "Healthy Dining Options" },
    { icon: "Cleaning", text: "Regular Housekeeping" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Icon components
  const IconSecurity = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const IconWiFi = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );

  const IconStudy = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const IconFitness = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const IconFood = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );

  const IconCleaning = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  const iconComponents = {
    Security: IconSecurity,
    WiFi: IconWiFi,
    Study: IconStudy,
    Fitness: IconFitness,
    Food: IconFood,
    Cleaning: IconCleaning
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        {images.map((img, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentImage === index ? 1 : 0,
              scale: currentImage === index ? 1 : 1.1
            }}
            transition={{ duration: 1.5 }}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-blue-900/60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30"></div>
          </motion.div>
        ))}
      </div>

      {/* Floating Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(90deg, #ffffff 1px, transparent 1px),
                           linear-gradient(180deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 lg:pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {/* Premium Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="font-semibold">Premium Student Accommodation</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="block text-white">Modern Living</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                For Academic Success
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl"
            >
              Experience comfortable, secure, and modern student accommodation 
              designed to support your academic journey. All amenities included 
              for a productive campus life.
            </motion.p>

            {/* Features Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-10"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const IconComponent = iconComponents[feature.icon];
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-white/10">
                        <IconComponent />
                      </div>
                      <span className="text-gray-100">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <span>Book Your Room</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>View Virtual Tour</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-gray-300 text-xs">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Image Gallery Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm bg-black/20">
              <div className="aspect-[4/3] relative">
                {/* Current Image Display */}
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${images[currentImage]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Image Info */}
                <div className="absolute bottom-6 left-6">
                  <div className="text-white">
                    <div className="text-sm text-gray-300">Premium Facility</div>
                    <div className="text-xl font-semibold">Modern Student Living</div>
                  </div>
                </div>
              </div>
              
              {/* Image Navigation */}
              <div className="absolute bottom-4 right-4">
                <div className="flex items-center space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${currentImage === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -top-4 -left-4"
            >
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Certified</div>
                    <div className="text-gray-300 text-sm">Quality Standards</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -bottom-4 -right-4"
            >
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">4.9/5</div>
                    <div className="text-gray-300 text-sm">Student Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center space-y-2"
        >
          <div className="text-white/70 text-sm">Explore More</div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* Smooth image transitions */
        .image-transition {
          transition: opacity 1.5s ease-in-out;
        }
        
        /* Custom scrollbar */
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;