import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Input field component moved outside to prevent re-rendering issues
const InputField = ({ label, name, type = 'text', placeholder, icon, value, onChange, error }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-medium mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className={`${icon} text-gray-400 text-sm`}></i>
      </div>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
          error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
        }`}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
);

const StudentRegistration = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    itNumber: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science',
    address: '',
    profilePhoto: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const departments = [
    { value: 'Computer Science', label: 'Computer Science', icon: 'bi-laptop', desc: 'Computer Science & IT' },
    { value: 'Engineering', label: 'Engineering', icon: 'bi-tools', desc: 'Civil & Mechanical Engineering' },
    { value: 'Business', label: 'Business', icon: 'bi-graph-up', desc: 'Management & Commerce' },
    { value: 'Medicine', label: 'Medicine', icon: 'bi-heart-pulse', desc: 'Medical Sciences' },
    { value: 'Law', label: 'Law', icon: 'bi-scale', desc: 'Legal Studies' },
    { value: 'Other', label: 'Other', icon: 'bi-building', desc: 'Other Departments' }
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
    setShowSuccessMessage(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.itNumber.trim()) errors.itNumber = 'IT Number is required';
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.profilePhoto) errors.profilePhoto = 'Profile photo is required';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    setShowSuccessMessage(false);
    
    try {
      let profilePhotoBase64 = '';
      if (formData.profilePhoto) {
        profilePhotoBase64 = await convertToBase64(formData.profilePhoto);
      }

      const submitData = {
        itNumber: formData.itNumber,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        department: formData.department,
        address: formData.address,
        profilePhoto: profilePhotoBase64
      };

      console.log("Sending data to backend:", submitData);

      const response = await axios.post('http://localhost:5000/api/auth/register', submitData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Response from backend:", response.data);

      if (response.data.success) {
        setShowSuccessMessage(true);
        
        setFormData({
          itNumber: '',
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          department: 'Computer Science',
          address: '',
          profilePhoto: null
        });
        setPhotoPreview(null);
        setFieldErrors({});
        
        setTimeout(() => {
          navigate('/SignIn');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error details:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        setServerError(error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`);
      } else if (error.request) {
        setServerError('Cannot connect to server. Please make sure the backend is running on port 5000');
      } else {
        setServerError(error.message || 'Registration failed. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    navigate('/SignIn');
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg mb-4">
              <i className="bi bi-mortarboard-fill text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Student Registration</h1>
            <p className="text-gray-500 mt-1 text-sm">Create your academic account</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <i className="bi bi-person-plus text-blue-600"></i>
                <h2 className="font-semibold text-gray-800">Registration Form</h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">Please fill in all required fields (*)</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="bi bi-check-circle-fill text-green-600 text-xl"></i>
                    <div>
                      <p className="text-green-800 font-medium">Registration Successful!</p>
                      <p className="text-green-600 text-sm">Redirecting to Sign In page...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Server Error Message */}
              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">Error:</p>
                  <p className="text-red-600 text-sm">{serverError}</p>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <InputField
                    label="IT Number"
                    name="itNumber"
                    placeholder="IT12345678"
                    icon="bi bi-credit-card-2-front-fill"
                    value={formData.itNumber}
                    onChange={handleChange}
                    error={fieldErrors.itNumber}
                  />
                  <InputField
                    label="Full Name"
                    name="fullName"
                    placeholder="John Michael Doe"
                    icon="bi bi-person-fill"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={fieldErrors.fullName}
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="john.doe@university.edu"
                    icon="bi bi-envelope-fill"
                    value={formData.email}
                    onChange={handleChange}
                    error={fieldErrors.email}
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    placeholder="0771234567"
                    icon="bi bi-telephone-fill"
                    value={formData.phone}
                    onChange={handleChange}
                    error={fieldErrors.phone}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="bi bi-lock-fill text-gray-400 text-sm"></i>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className={`w-full pl-9 pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                          fieldErrors.password ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
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
                    {fieldErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="bi bi-lock-fill text-gray-400 text-sm"></i>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`w-full pl-9 pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                          fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <i className={showConfirmPassword ? "bi bi-eye-slash text-sm" : "bi bi-eye text-sm"}></i>
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Department Selection */}
              <div className="mt-6 mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  Department / Faculty <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {departments.map((dept) => (
                    <label
                      key={dept.value}
                      className={`relative cursor-pointer transition-all duration-200 ${
                        formData.department === dept.value ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="department"
                        value={dept.value}
                        checked={formData.department === dept.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.department === dept.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            formData.department === dept.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <i className={`bi ${dept.icon} text-sm`}></i>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${formData.department === dept.value ? 'text-blue-700' : 'text-gray-700'}`}>
                              {dept.label}
                            </p>
                            <p className="text-xs text-gray-400">{dept.desc}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address Field */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 pointer-events-none">
                    <i className="bi bi-geo-alt-fill text-gray-400 text-sm"></i>
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter your complete residential address"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      fieldErrors.address ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Profile Photo Upload */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  Profile Photo <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Photo Preview */}
                  <div className="relative group">
                    <div className={`w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 transition-all duration-300 ${
                      photoPreview ? 'border-blue-500' : 'border-dashed border-gray-300'
                    }`}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <i className="bi bi-camera-fill text-2xl text-gray-400"></i>
                      )}
                    </div>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profilePhoto: null }));
                          setPhotoPreview(null);
                          setFieldErrors(prev => ({ ...prev, profilePhoto: '' }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all"
                      >
                        <i className="bi bi-x text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <input
                      type="file"
                      name="profilePhoto"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleChange}
                      className="hidden"
                      id="profilePhotoInput"
                    />
                    <label
                      htmlFor="profilePhotoInput"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <i className="bi bi-camera-fill"></i>
                      Choose Photo
                    </label>
                    <p className="text-xs text-gray-400 mt-2">JPG, JPEG or PNG • Max 5MB</p>
                    {fieldErrors.profilePhoto && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.profilePhoto}</p>
                    )}
                  </div>
                </div>
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill text-sm"></i>
                    <span>Register Student Account</span>
                  </>
                )}
              </button>

              {/* Sign In Link */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={handleSignIn}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
                  >
                    Sign in here
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

export default StudentRegistration;