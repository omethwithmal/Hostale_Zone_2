// ProfessionalAbout.jsx
import React from 'react';

const ProfessionalAbout = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "24/7 Security",
      description: "Advanced surveillance and professional security staff"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      title: "High-Speed Internet",
      description: "Fiber optic connectivity for all academic needs"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Academic Support",
      description: "Dedicated study areas and library resources"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Community Focus",
      description: "Social events and networking opportunities"
    }
  ];

  const milestones = [
    { year: "2015", title: "Foundation", description: "Established with 50 rooms" },
    { year: "2018", title: "Expansion", description: "Expanded to 3 locations" },
    { year: "2021", title: "Digital Transformation", description: "Implemented smart systems" },
    { year: "2024", title: "Excellence Award", description: "Recognized for quality service" }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      position: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      experience: "15+ years in hospitality"
    },
    {
      name: "Michael Chen",
      position: "Operations Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      experience: "Expert in facility management"
    },
    {
      name: "Priya Sharma",
      position: "Student Relations Head",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      experience: "10+ years student services"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
  {/* Hero Section */}
  <div className="relative bg-gradient-to-b from-blue-600/98 to-blue-700/98 text-white pt-24 pb-20">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop")' }}
    >
      <div className="absolute inset-0 bg-black/70"></div> {/* Reduced opacity */}
    </div>
    
    <div className="relative container mx-auto px-6">
      <div className="max-w-3xl">
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
          <span className="text-sm font-semibold">ABOUT US</span>
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Excellence in Student Accommodation
        </h1>
        
        <p className="text-xl text-white/90 leading-relaxed mb-8">
          For nearly a decade, we have been providing premium hostel facilities that 
          combine modern comfort with academic support for thousands of students.
        </p>
        
        <div className="flex space-x-4">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
            Book a Tour
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  </div>  

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission & Vision
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-600">
                      To provide safe, comfortable, and technologically advanced accommodation 
                      that supports academic success and personal development.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Vision</h3>
                    <p className="text-gray-600">
                      To become the leading provider of student accommodation, setting new 
                      standards for quality, innovation, and student satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Modern hostel architecture" 
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">9+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="h-12 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">5,000+</div>
                    <div className="text-sm text-gray-600">Students Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Facilities & Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive amenities designed for student success and comfort
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

     

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Campus Life
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Modern room interior" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1519452639340-94f2ae3c2f6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Study area" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Recreational area" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      

      
    </div>
  );
};

export default ProfessionalAbout;