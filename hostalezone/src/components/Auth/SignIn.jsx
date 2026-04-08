import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator', icon: 'bi-shield-lock-fill', desc: 'System Management' },
    { value: 'student', label: 'Student', icon: 'bi-mortarboard-fill', desc: 'Learning Platform' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Sign In Data:', { email: formData.email, password: formData.password, role: formData.role, rememberMe });
      
      const roleName = formData.role === 'admin' ? 'Administrator' : 'Student';
      alert(`Welcome ${roleName}! Sign in successful.\nCheck console for details.`);
    }
    setIsSubmitting(false);
  };

  const handleCreateAccount = () => {
    navigate('/StudentRegistration');
  };

  return (
    <>
      {/* Bootstrap Icons CDN */}
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
                        formData.role === role.value ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.role === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            formData.role === role.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <i className={`${role.icon} text-sm`}></i>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${formData.role === role.value ? 'text-blue-700' : 'text-gray-700'}`}>
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
                    placeholder="name@university.edu"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      touched.email && errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                  />
                </div>
                {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                      touched.password && errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <i className={showPassword ? "bi bi-eye-slash text-sm" : "bi bi-eye text-sm"}></i>
                  </button>
                </div>
                {touched.password && errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
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

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <i className="bi bi-google text-sm"></i>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <i className="bi bi-microsoft text-sm"></i>
                  Microsoft
                </button>
              </div>

              {/* Sign Up Link - Connected to StudentRegistration */}
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