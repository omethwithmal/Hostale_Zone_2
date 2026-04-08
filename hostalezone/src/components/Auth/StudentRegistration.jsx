import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentRegistration = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    itNumber: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: 'computing',
    address: '',
    profilePhoto: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    { value: 'computing', label: 'Computing', icon: 'bi-laptop', desc: 'Computer Science & IT' },
    { value: 'business', label: 'Business', icon: 'bi-graph-up', desc: 'Management & Commerce' },
    { value: 'engineering', label: 'Engineering', icon: 'bi-tools', desc: 'Civil & Mechanical' }
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
      if (errors.profilePhoto) {
        setErrors(prev => ({ ...prev, profilePhoto: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'itNumber':
        if (!value.trim()) return 'IT Number is required';
        if (!/^IT\d{6,8}$/i.test(value.trim())) return 'Format: IT followed by 6-8 digits (e.g., IT123456)';
        return '';
      case 'fullName':
        if (!value.trim()) return 'Full Name is required';
        if (value.trim().length < 3) return 'Minimum 3 characters';
        if (!/^[A-Za-z\s]{3,50}$/.test(value.trim())) return 'Only letters and spaces allowed';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneClean = value.replace(/[\s-+()]/g, '');
        if (!/^[0-9]{10,12}$/.test(phoneClean)) return 'Enter 10-12 digits';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'At least 8 characters';
        if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(value)) return 'Must contain uppercase, lowercase & number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Please enter complete address';
        return '';
      case 'profilePhoto':
        if (!value) return 'Profile photo is required';
        if (value && !['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)) return 'Only JPG, JPEG, or PNG';
        if (value && value.size > 5 * 1024 * 1024) return 'Max size 5MB';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const fields = ['itNumber', 'fullName', 'email', 'phone', 'password', 'confirmPassword', 'address', 'profilePhoto'];
    const newErrors = {};
    let isValid = true;
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      const { confirmPassword, ...submitData } = formData;
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Registration Data:', submitData);
      alert('✅ Registration Successful! Check console for details.');
    }
    setIsSubmitting(false);
  };

  const handleSignIn = () => {
    navigate('/SignIn');
  };

  const InputField = ({ label, name, type = 'text', placeholder, icon, required = true }) => {
    const error = touched[name] ? errors[name] : '';
    const value = formData[name];
    
    return (
      <div className="mb-4 group">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className={`${icon} text-gray-400 text-sm transition-colors duration-200 group-focus-within:text-blue-500 ${error ? 'text-red-400' : ''}`}></i>
            </div>
          )}
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {value && !error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <i className="bi bi-check-circle-fill text-green-500 text-xs"></i>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <>
      {/* Bootstrap Icons CDN */}
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
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <InputField
                    label="IT Number"
                    name="itNumber"
                    placeholder="IT12345678"
                    icon="bi bi-credit-card-2-front-fill"
                  />
                  <InputField
                    label="Full Name"
                    name="fullName"
                    placeholder="John Michael Doe"
                    icon="bi bi-person-fill"
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="john.doe@university.edu"
                    icon="bi bi-envelope-fill"
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    placeholder="+94 77 123 4567"
                    icon="bi bi-telephone-fill"
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Password Field */}
                  <div className="mb-4 group">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className={`bi bi-lock-fill text-gray-400 text-sm transition-colors duration-200 group-focus-within:text-blue-500 ${touched.password && errors.password ? 'text-red-400' : ''}`}></i>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="Create a strong password"
                        className={`w-full pl-9 pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                          touched.password && errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
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
                    {!errors.password && formData.password && (
                      <div className="mt-2 flex gap-3 text-xs flex-wrap">
                        <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className="bi bi-check-circle-fill text-xs"></i> 8+ chars
                        </span>
                        <span className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className="bi bi-check-circle-fill text-xs"></i> Uppercase
                        </span>
                        <span className={`flex items-center gap-1 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className="bi bi-check-circle-fill text-xs"></i> Lowercase
                        </span>
                        <span className={`flex items-center gap-1 ${/(?=.*[0-9])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className="bi bi-check-circle-fill text-xs"></i> Number
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4 group">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className={`bi bi-lock-fill text-gray-400 text-sm transition-colors duration-200 group-focus-within:text-blue-500 ${touched.confirmPassword && errors.confirmPassword ? 'text-red-400' : ''}`}></i>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="Confirm your password"
                        className={`w-full pl-9 pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                          touched.confirmPassword && errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
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
                    {touched.confirmPassword && errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-check-circle-fill text-xs"></i> Passwords match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Department Selection */}
              <div className="mt-6 mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  Department / Faculty <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <i className={`bi bi-geo-alt-fill text-gray-400 text-sm ${touched.address && errors.address ? 'text-red-400' : ''}`}></i>
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={() => handleBlur('address')}
                    rows="3"
                    placeholder="Enter your complete residential address"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      touched.address && errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {touched.address && errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                      onBlur={() => handleBlur('profilePhoto')}
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
                    {touched.profilePhoto && errors.profilePhoto && (
                      <p className="text-red-500 text-xs mt-1">{errors.profilePhoto}</p>
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