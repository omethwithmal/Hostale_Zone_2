// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  InformationCircleIcon, 
  PhoneIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Modern white and blue color palette
  const colors = {
    primary: '#FFFFFF',           // White background
    secondary: '#1E40AF',         // Deep blue
    accent: '#3B82F6',           // Bright blue
    hover: '#60A5FA',            // Light blue for hover
    highlight: '#1E40AF',        // Blue for active states
    text: '#1F2937',             // Dark gray for text
    textLight: '#FFFFFF',        // White text for blue backgrounds
    border: '#E5E7EB',           // Light border
    badge: '#EF4444'             // Red for badges/notifications
  };

  const navItems = [
    { name: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
    { name: 'About', icon: <InformationCircleIcon className="w-5 h-5" /> },
    { name: 'Contact', icon: <PhoneIcon className="w-5 h-5" /> },
    { name: 'Rooms', icon: <BuildingOfficeIcon className="w-5 h-5" />, badge: 3 },
    { name: 'Rules', icon: <DocumentTextIcon className="w-5 h-5" /> },
  ];

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
    setIsMobileMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-xl backdrop-blur-lg bg-white/95' : 'shadow-md bg-white'
      }`}
      style={{ borderBottom: `2px solid ${colors.border}` }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo/Brand with creative design */}
          <div className="flex items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavClick('Home')}
            >
              {/* Enhanced logo with gradient border */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white border-4 border-white">
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <ShieldCheckIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Brand text with creative typography */}
              <div className="flex flex-col">
                <span 
                  className="text-xl lg:text-2xl font-bold tracking-tight"
                  style={{ color: colors.secondary }}
                >
                  HOSTEL
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    EZONE
                  </span>
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  Your Comfort Zone
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                <button
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 relative ${
                    activeItem === item.name 
                      ? 'transform scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    color: activeItem === item.name ? colors.secondary : colors.text,
                    backgroundColor: activeItem === item.name ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  }}
                >
                  {item.icon}
                  <span className="font-semibold">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full text-white animate-pulse"
                          style={{ backgroundColor: colors.badge }}>
                      {item.badge}
                    </span>
                  )}
                  {/* Active indicator */}
                  {activeItem === item.name && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 rounded-t-full"
                         style={{ backgroundColor: colors.accent }}></div>
                  )}
                </button>
              </div>
            ))}
            
            {/* Profile Button */}
            <div className="relative ml-4">
              <button
                onClick={() => handleNavClick('Profile')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeItem === 'Profile' ? 'ring-2 ring-blue-200' : ''
                }`}
                style={{
                  color: activeItem === 'Profile' ? colors.secondary : colors.text,
                  backgroundColor: activeItem === 'Profile' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                }}
              >
                <UserCircleIcon className="w-5 h-5" />
                <span className="font-semibold">Profile</span>
              </button>
            </div>
            
            {/* Login/Logout Button with animated gradient */}
            <button
              onClick={toggleLogin}
              className="ml-6 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105"
                   style={{ 
                     backgroundColor: colors.secondary,
                     color: colors.textLight
                   }}>
                {isLoggedIn ? (
                  <>
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Mobile menu button with animated icon */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                isMobileMenuOpen ? 'bg-blue-50' : ''
              }`}
              style={{ color: colors.secondary }}
            >
              <div className="relative w-6 h-6">
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 animate-spin-in" />
                ) : (
                  <Bars3Icon className="w-6 h-6 animate-pulse" />
                )}
              </div>
              {/* Mobile indicator dot */}
              {!isMobileMenuOpen && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-bounce"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Slide in animation */}
      <div 
        className={`lg:hidden fixed inset-x-0 top-16 z-40 transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="mx-4 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: `2px solid ${colors.border}`
          }}
        >
          <div className="flex flex-col p-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className={`flex items-center justify-between space-x-3 px-4 py-4 my-1 rounded-xl transition-all duration-300 ${
                  activeItem === item.name ? 'bg-blue-50 transform scale-[1.02]' : ''
                }`}
                style={{
                  borderLeft: activeItem === item.name ? `4px solid ${colors.accent}` : '4px solid transparent',
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activeItem === item.name ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {React.cloneElement(item.icon, {
                      className: "w-5 h-5",
                      style: { color: activeItem === item.name ? colors.accent : colors.text }
                    })}
                  </div>
                  <span className={`font-semibold ${
                    activeItem === item.name ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {item.name}
                  </span>
                </div>
                {item.badge && (
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full text-white animate-pulse"
                        style={{ backgroundColor: colors.badge }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            
            {/* Profile Button */}
            <button
              onClick={() => handleNavClick('Profile')}
              className={`flex items-center justify-between space-x-3 px-4 py-4 my-1 rounded-xl transition-all duration-300 ${
                activeItem === 'Profile' ? 'bg-blue-50 transform scale-[1.02]' : ''
              }`}
              style={{
                borderLeft: activeItem === 'Profile' ? `4px solid ${colors.accent}` : '4px solid transparent',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  activeItem === 'Profile' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <UserCircleIcon className="w-5 h-5" style={{ 
                    color: activeItem === 'Profile' ? colors.accent : colors.text 
                  }} />
                </div>
                <span className={`font-semibold ${
                  activeItem === 'Profile' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  Profile
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                isLoggedIn ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}></div>
            </button>
            
            {/* Login/Logout Button */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={toggleLogin}
                className="w-full flex items-center justify-center space-x-3 px-4 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
                  color: colors.textLight
                }}
              >
                {isLoggedIn ? (
                  <>
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Login to Continue</span>
                  </>
                )}
              </button>
              
              {/* Status Indicator */}
              <div className="mt-4 p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      isLoggedIn ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {isLoggedIn ? 'Connected' : 'Offline Mode'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Tap to {isLoggedIn ? 'logout' : 'login'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;