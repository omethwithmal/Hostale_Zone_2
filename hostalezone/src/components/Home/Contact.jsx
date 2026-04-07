// ContactPage.jsx
import React from 'react';

const ContactPage = () => {
  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Phone Support",
      details: ["+94 112 345 678", "+94 771 234 567"],
      description: "Available 24/7 for emergencies"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email",
      details: ["info@hostelezone.com", "support@hostelezone.com"],
      description: "Response within 24 hours"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Visit Us",
      details: ["University Hostel Complex", "Academic City, Colombo 07", "Sri Lanka"],
      description: "Open 8:00 AM - 8:00 PM daily"
    }
  ];

  const departments = [
    { name: "Admissions", email: "admissions@hostelezone.com", phone: "+94 112 345 671" },
    { name: "Student Support", email: "support@hostelezone.com", phone: "+94 112 345 672" },
    { name: "Accounts", email: "accounts@hostelezone.com", phone: "+94 112 345 673" },
    { name: "Maintenance", email: "maintenance@hostelezone.com", phone: "+94 112 345 674" }
  ];

  return (
    <div className="min-h-screen bg-white">
      
     

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Multiple Ways to Connect
            </h2>
            <p className="text-xl text-gray-600">
              Choose the most convenient way to reach our team
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-blue-600">
                    {method.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {method.title}
                </h3>
                <div className="space-y-2 mb-4">
                  {method.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Send Us a Message
              </h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="+94 77 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Subject
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition">
                    <option value="">Select a subject</option>
                    <option value="admissions">Admissions Inquiry</option>
                    <option value="support">Student Support</option>
                    <option value="rooms">Room Booking</option>
                    <option value="maintenance">Maintenance Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Message
                  </label>
                  <textarea
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="newsletter" className="ml-2 text-gray-600">
                    I'd like to receive updates and newsletters
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Map & Departments */}
            <div>
              {/* Map Container */}
              <div className="rounded-xl overflow-hidden shadow-lg mb-8">
                <div className="h-80 bg-gradient-to-br from-blue-100 to-blue-200 relative">
                  {/* Mock Map - Replace with actual map component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Location</h3>
                      <p className="text-gray-600">University Hostel Complex, Colombo 07</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Departments */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Specific Departments
                </h3>
                
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                          <p className="text-sm text-gray-600">{dept.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{dept.phone}</p>
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Contact →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Business Hours */}
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Office Hours
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium text-gray-900">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium text-gray-900">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="pt-4 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Emergency Support</span>
                      <span className="font-bold text-blue-600">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What are the admission requirements?
                </h4>
                <p className="text-gray-600">
                  You need to be a registered university student with valid ID. 
                  Complete our online application form and submit required documents.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Is security deposit required?
                </h4>
                <p className="text-gray-600">
                  Yes, a one-month security deposit is required upon admission, 
                  refundable upon completion of your stay.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What amenities are included?
                </h4>
                <p className="text-gray-600">
                  All rooms include WiFi, furniture, study desk, and access to 
                  common areas, kitchen, and laundry facilities.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  How do I make payments?
                </h4>
                <p className="text-gray-600">
                  Payments can be made online through our portal, bank transfer, 
                  or at our office. We accept major credit/debit cards.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Can I visit before applying?
                </h4>
                <p className="text-gray-600">
                  Yes, we offer campus tours by appointment. Contact us to 
                  schedule a visit and see our facilities.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What's the cancellation policy?
                </h4>
                <p className="text-gray-600">
                  Cancellations made 30 days before check-in receive full refund. 
                  Later cancellations may incur charges.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center mx-auto">
              View All FAQs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section with Image */}
<section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
  {/* Background Pattern (Optional) */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"></div>
    <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"></div>
  </div>
  
  <div className="container mx-auto px-6 relative z-10">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
      
      {/* Left Side - Image */}
      <div className="lg:w-1/2">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Customer Support Team" 
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
          
          {/* Badge on Image */}
          <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            24/7 Available
          </div>
        </div>
        
        {/* Stats under image */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-blue-200">Support</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">15min</div>
            <div className="text-sm text-blue-200">Response Time</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-blue-200">Satisfaction</div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Content */}
      <div className="lg:w-1/2 text-center lg:text-left">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Need Immediate <span className="text-blue-200">Assistance?</span>
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl">
          Our dedicated team is ready to help you with any questions or concerns. 
          We're just a call or click away!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="text-left">
              <div className="text-sm">Call Now</div>
              <div className="font-bold">+94 112 345 678</div>
            </div>
          </button>
          
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:border-blue-300 flex items-center justify-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-left">
              <div className="text-sm">Live Chat</div>
              <div className="font-bold">Instant Support</div>
            </div>
          </button>
        </div>
        
        <div className="mt-10 p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex -space-x-4 mr-4">
              <img className="w-12 h-12 rounded-full border-2 border-blue-600" src="https://i.pravatar.cc/150?img=1" alt="Support Agent" />
              <img className="w-12 h-12 rounded-full border-2 border-blue-600" src="https://i.pravatar.cc/150?img=2" alt="Support Agent" />
              <img className="w-12 h-12 rounded-full border-2 border-blue-600" src="https://i.pravatar.cc/150?img=3" alt="Support Agent" />
            </div>
            <div>
              <p className="text-blue-200 font-semibold">12 Support Agents Online</p>
              <p className="text-sm text-blue-300">Average response time: 15 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ContactPage;