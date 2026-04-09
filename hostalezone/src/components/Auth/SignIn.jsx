import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState('');

  const roles = [
    { value: 'admin', label: 'Administrator', icon: 'bi-shield-lock-fill', desc: 'System Management' },
    { value: 'student', label: 'Student', icon: 'bi-mortarboard-fill', desc: 'Learning Platform' }
  ];

  // 🎯 Email to Route mapping
  const emailRoutes = {
    'ometh@gmail.com': '/RoomManagementDashboard',
    'ranga@gmail.com': '/R_AdminDashboard',
    'hansika@gmail.com': '/R_AdminDashboard',
    'angalee@gmail.com': '/R_AdminDashboard'
  };

  // 🎯 Valid Users (Frontend only - for testing)
  const validUsers = {
    'ometh@gmail.com': { password: '123456', fullName: 'Ometh', userType: 'admin' },
    'ranga@gmail.com': { password: '123456', fullName: 'Ranga', userType: 'admin' },
    'hansika@gmail.com': { password: '123456', fullName: 'Hansika', userType: 'admin' },
    'angalee@gmail.com': { password: '123456', fullName: 'Angalee', userType: 'admin' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 🎯 Function to determine redirect URL based on email
  const getRedirectUrl = (email, userType) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check for special email routes first
    if (emailRoutes[normalizedEmail]) {
      return emailRoutes[normalizedEmail];
    }
    
    // Default role-based routing
    if (userType === 'admin') {
      return '/admin-dashboard';
    }
    
    return '/StudentProfile';
  };

  // 🎯 Frontend only login - NO BACKEND CALL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');

    if (validateForm()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const normalizedEmail = formData.email.toLowerCase().trim();
      const user = validUsers[normalizedEmail];
      
      // Check if user exists and password matches
      if (user && user.password === formData.password) {
        // Create mock user data
        const mockUser = {
          fullName: user.fullName,
          email: formData.email,
          userType: formData.userType
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token-123456');
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Get redirect URL
        const redirectUrl = getRedirectUrl(formData.email, formData.userType);
        
        // Show success message
        alert(`Welcome ${user.fullName}! Login successful.`);
        
        // Navigate
        navigate(redirectUrl);
      } else {
        setServerError('Invalid email or password. Please try again.');
      }
    }
    setIsSubmitting(false);
  };

  const handleCreateAccount = () => {
    navigate('/StudentRegistration');
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg mb-4">
              <i className="bi bi-building text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">University Portal</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <i className="bi bi-box-arrow-in-right text-blue-600"></i>
                <h2 className="font-semibold text-gray-800">Account Sign In</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                  <i className="bi bi-exclamation-triangle-fill text-red-500 mt-0.5"></i>
                  <span>{serverError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  Login As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`relative cursor-pointer transition-all duration-200 ${
                        formData.userType === role.value ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={role.value}
                        checked={formData.userType === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.userType === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            formData.userType === role.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <i className={`${role.icon} text-sm`}></i>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${formData.userType === role.value ? 'text-blue-700' : 'text-gray-700'}`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-gray-400">{role.desc}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-envelope text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="Enter your email address"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      touched.email && errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-lock text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    className={`w-full pl-9 pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      touched.password && errors.password ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={showPassword ? "bi bi-eye-slash text-sm" : "bi bi-eye text-sm"}></i>
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-xs text-gray-500">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link will be sent to your email')}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <i className="bi bi-arrow-repeat bi-spin text-sm"></i>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right text-sm"></i>
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="mt-5 text-center">
                <p className="text-xs text-gray-500">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={handleCreateAccount}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </form>
          </div>

          

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              &copy; 2024 University Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .bi-spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>
    </>
  );
};

export default SignIn;