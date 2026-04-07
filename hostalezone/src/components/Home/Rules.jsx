// RulesPage.jsx
import React from 'react';

const RulesPage = () => {
  const importantRules = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Security & Safety",
      rules: [
        "No unauthorized guests in rooms after 10 PM",
        "Always carry your ID card and room key",
        "Report any security concerns immediately",
        "No tampering with fire safety equipment"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Quiet Hours",
      rules: [
        "Quiet hours: 10 PM to 7 AM daily",
        "No loud music or disturbances during study hours",
        "Respect others' need for quiet study time",
        "Use headphones in common areas"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: "Room Maintenance",
      rules: [
        "Keep rooms clean and tidy at all times",
        "Report maintenance issues within 24 hours",
        "No permanent modifications to rooms",
        "Regular room inspections will be conducted"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Fee & Payment",
      rules: [
        "All fees must be paid by the 5th of each month",
        "Late payment penalty: 5% of monthly fee",
        "Security deposit refunded upon departure",
        "Receipts must be kept for all payments"
      ]
    }
  ];

  const generalRules = [
    {
      category: "Common Areas",
      rules: [
        "Clean up after using kitchen facilities",
        "No personal items left in common areas overnight",
        "TV volume must be kept at reasonable levels",
        "Furniture must not be moved without permission"
      ]
    },
    {
      category: "Guest Policy",
      rules: [
        "Day guests allowed until 10 PM only",
        "Overnight guests require prior approval",
        "Maximum 2 guests per resident at a time",
        "Residents responsible for guest behavior"
      ]
    },
    {
      category: "Internet Usage",
      rules: [
        "No illegal downloading or file sharing",
        "Respect bandwidth limits during peak hours",
        "Report internet issues to IT support",
        "No personal routers or network devices"
      ]
    }
  ];

  const prohibitedItems = [
    "Alcohol and illegal substances",
    "Weapons of any kind",
    "Cooking appliances in rooms (except electric kettle)",
    "Pets (except service animals with documentation)",
    "Fireworks or flammable materials",
    "Smoking materials (designated smoking areas only)"
  ];

  const violationConsequences = [
    {
      level: "Minor Violation",
      examples: ["Excessive noise", "Untidy common areas", "Late payments"],
      actions: ["Verbal warning", "Written notice", "Small fine"]
    },
    {
      level: "Major Violation",
      examples: ["Unauthorized guests", "Property damage", "Repeated noise complaints"],
      actions: ["Substantial fine", "Probation period", "Parent/guardian notification"]
    },
    {
      level: "Severe Violation",
      examples: ["Illegal substances", "Violence or threats", "Fire safety violations"],
      actions: ["Immediate eviction", "Security deposit forfeiture", "Legal action"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
     

      {/* Important Rules */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Essential Rules & Guidelines
            </h2>
            <p className="text-xl text-gray-600">
              These fundamental rules ensure safety and harmony for all residents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {importantRules.map((category, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-blue-600">
                    {category.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      </div>
                      <span className="text-gray-600">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Rules */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              General Regulations
            </h2>
            <p className="text-xl text-gray-600">
              Additional guidelines for specific areas and activities
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {generalRules.map((section, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {section.category}
                  </h3>
                </div>
                
                <ul className="space-y-3">
                  {section.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-600">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited Items & Violations */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Prohibited Items */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Prohibited Items
              </h2>
              
              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Strictly Forbidden</h3>
                    <p className="text-red-600 text-sm">Possession may lead to immediate eviction</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {prohibitedItems.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Emergency Contacts */}
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Emergency Contacts
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Security Control Room</span>
                    <span className="font-medium text-blue-600">+94 771 234 567</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Medical Emergency</span>
                    <span className="font-medium text-blue-600">+94 112 345 679</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fire Department</span>
                    <span className="font-medium text-blue-600">110</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Violation Consequences */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Violation Consequences
              </h2>
              
              <div className="space-y-6">
                {violationConsequences.map((level, index) => (
                  <div 
                    key={index} 
                    className={`p-6 rounded-xl border ${index === 0 ? 'bg-yellow-50 border-yellow-100' : index === 1 ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {level.level}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {index === 0 ? 'Warning' : index === 1 ? 'Serious' : 'Severe'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Examples:</h4>
                      <div className="flex flex-wrap gap-2">
                        {level.examples.map((example, idx) => (
                          <span 
                            key={idx} 
                            className={`px-3 py-1 rounded-full text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Possible Actions:</h4>
                      <ul className="space-y-2">
                        {level.actions.map((action, idx) => (
                          <li key={idx} className="flex items-center">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-gray-600">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agreement Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Resident Agreement
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    </div>
                  </div>
                  <p className="ml-4 text-gray-600">
                    I acknowledge that I have read and understood all hostel rules and regulations.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    </div>
                  </div>
                  <p className="ml-4 text-gray-600">
                    I agree to comply with all rules and accept consequences for violations.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    </div>
                  </div>
                  <p className="ml-4 text-gray-600">
                    I understand that rules may be updated, and I am responsible for staying informed.
                  </p>
                </div>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-xl mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Important Note</h4>
                    <p className="text-gray-600">
                      All residents must sign the official rule agreement form during check-in. 
                      Digital acknowledgement through this portal does not replace the physical signature requirement.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                  Acknowledge & Accept Rules
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Request Clarification
                </button>
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
              Rules & Regulations FAQ
            </h2>
            <p className="text-xl text-gray-600">
              Common questions about hostel rules
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Can rules be modified for special circumstances?
                </h4>
                <p className="text-gray-600">
                  Some rules may be adjusted with prior written approval from management. 
                  Contact the warden's office for special requests.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  How are rule violations reported?
                </h4>
                <p className="text-gray-600">
                  Violations can be reported anonymously through our online portal 
                  or directly to security staff. All reports are investigated.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What if I disagree with a rule violation notice?
                </h4>
                <p className="text-gray-600">
                  You may appeal within 7 days by submitting a written appeal to 
                  the Hostel Management Committee.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Are parents notified of rule violations?
                </h4>
                <p className="text-gray-600">
                  For serious or repeated violations, parents/guardians may be 
                  notified as part of the disciplinary process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* CTA Section */}
<section className="relative py-20 text-white overflow-hidden">
  {/* Background Image with Overlay */}
  <div className="absolute inset-0 z-0">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80")'
      }}
    >
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/80"></div>
    </div>
  </div>

  <div className="container relative z-10 mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold mb-6">
      Need Rule Clarification?
    </h2>
    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
      Contact our management team for any questions about rules or regulations
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
        Contact Warden's Office
      </button>
      <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
        Schedule Meeting
      </button>
    </div>
    
    <p className="mt-8 text-blue-200 text-sm backdrop-blur-sm bg-white/10 inline-block px-4 py-2 rounded-lg">
      Office Hours: Monday to Friday, 9:00 AM - 5:00 PM
    </p>
  </div>
</section>  
    </div>
  );
};

export default RulesPage;