import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentProfile = () => {
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    itNumber: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    address: '',
    roomNumber: '',
    block: '',
    joiningDate: '',
    profilePhoto: null
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const departments = [
    { value: 'Computer Science', label: 'Computer Science', icon: 'bi-laptop' },
    { value: 'Engineering', label: 'Engineering', icon: 'bi-tools' },
    { value: 'Business', label: 'Business', icon: 'bi-graph-up' },
    { value: 'Medicine', label: 'Medicine', icon: 'bi-heart-pulse' },
    { value: 'Law', label: 'Law', icon: 'bi-scale' },
    { value: 'Other', label: 'Other', icon: 'bi-building' }
  ];

  const quickActions = [
    { id: 'roomChange', label: 'Room Change Request', icon: 'bi-arrow-left-right', route: '/room-change-request' },
    { id: 'payments', label: 'View Payment Details', icon: 'bi-credit-card', route: '/payments' },
    { id: 'leaveRequest', label: 'Leave Request', icon: 'bi-calendar-check', route: '/LeaveRequest' },
    { id: 'complaint', label: 'Submit Complaint', icon: 'bi-chat-dots', route: '/complaint' }
  ];

  const activities = [
    { 
      id: 1,
      action: 'Room Change Request', 
      status: 'Pending', 
      date: 'Mar 15, 2024', 
      icon: 'bi-arrow-left-right',
      colorTheme: 'blue',
      details: {
        requestId: 'RCR-2024-0012',
        currentRoom: 'B-204',
        requestedRoom: 'C-108',
        reason: 'Need a room closer to the study area and with better ventilation.',
        priority: 'Medium',
        submittedBy: 'John Michael Doe',
        submittedDate: '2024-03-15T10:30:00',
        adminRemark: 'Under review by accommodation office.',
        estimatedResponse: '3-5 business days'
      }
    },
    { 
      id: 2,
      action: 'Fee Payment', 
      status: 'Completed', 
      date: 'Mar 10, 2024', 
      icon: 'bi-credit-card',
      colorTheme: 'green',
      details: {
        transactionId: 'TXN-20240310-0045',
        amount: '$1,250.00',
        paymentMethod: 'Credit Card (**** 4532)',
        paymentDate: '2024-03-10T14:15:00',
        receiptUrl: '#',
        invoiceNumber: 'INV-SLIIT-0324-09',
        description: 'Monthly Accommodation Fee - March 2024',
        status: 'Success',
        paymentGateway: 'PayHere'
      }
    },
    { 
      id: 3,
      action: 'Maintenance Request', 
      status: 'In Progress', 
      date: 'Mar 05, 2024', 
      icon: 'bi-tools',
      colorTheme: 'orange',
      details: {
        requestId: 'MNT-2024-0087',
        issueType: 'Plumbing',
        description: 'Water leakage from the bathroom sink pipe.',
        priority: 'High',
        assignedTo: 'Maintenance Team B',
        scheduledDate: 'Mar 18, 2024',
        submittedDate: '2024-03-05T09:20:00',
        lastUpdate: 'Parts ordered - waiting for delivery',
        estimatedCompletion: 'Mar 20, 2024'
      }
    }
  ];

  // Fetch student profile on component mount
  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          // No token or user data, redirect to login
          navigate('/SignIn');
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // If user data is already in localStorage, use it
        if (user && user.itNumber) {
          setProfileData({
            itNumber: user.itNumber || '',
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            department: user.department || 'Computer Science',
            address: user.address || '',
            roomNumber: user.roomNumber || 'Not Assigned',
            block: user.block || 'Not Assigned',
            joiningDate: user.joiningDate || new Date().toISOString().split('T')[0],
            profilePhoto: user.profilePhoto || null
          });
          setTempData({
            itNumber: user.itNumber || '',
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            department: user.department || 'Computer Science',
            address: user.address || '',
            roomNumber: user.roomNumber || 'Not Assigned',
            block: user.block || 'Not Assigned',
            joiningDate: user.joiningDate || new Date().toISOString().split('T')[0],
            profilePhoto: user.profilePhoto || null
          });
          
          // Set photo preview if profile photo exists
          if (user.profilePhoto) {
            setPhotoPreview(user.profilePhoto);
          }
        } else {
          // Fetch fresh data from backend
          const response = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          });
          
          if (response.data.success && response.data.user) {
            const userData = response.data.user;
            setProfileData({
              itNumber: userData.itNumber || '',
              fullName: userData.fullName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              department: userData.department || 'Computer Science',
              address: userData.address || '',
              roomNumber: userData.roomNumber || 'Not Assigned',
              block: userData.block || 'Not Assigned',
              joiningDate: userData.joiningDate || new Date().toISOString().split('T')[0],
              profilePhoto: userData.profilePhoto || null
            });
            setTempData({
              itNumber: userData.itNumber || '',
              fullName: userData.fullName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              department: userData.department || 'Computer Science',
              address: userData.address || '',
              roomNumber: userData.roomNumber || 'Not Assigned',
              block: userData.block || 'Not Assigned',
              joiningDate: userData.joiningDate || new Date().toISOString().split('T')[0],
              profilePhoto: userData.profilePhoto || null
            });
            
            if (userData.profilePhoto) {
              setPhotoPreview(userData.profilePhoto);
            }
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401) {
          // Unauthorized, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/SignIn');
        } else {
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentProfile();
  }, [navigate]);

  const handleEditClick = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempData({ ...profileData });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setTempData(prev => ({ ...prev, profilePhoto: file }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateMessage('Session expired. Please login again.');
        setTimeout(() => navigate('/SignIn'), 2000);
        return;
      }
      
      let profilePhotoBase64 = tempData.profilePhoto;
      if (tempData.profilePhoto && typeof tempData.profilePhoto !== 'string') {
        profilePhotoBase64 = await convertToBase64(tempData.profilePhoto);
      }
      
      const updateData = {
        fullName: tempData.fullName,
        email: tempData.email,
        phone: tempData.phone,
        department: tempData.department,
        address: tempData.address,
        profilePhoto: profilePhotoBase64
      };
      
      const response = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        setProfileData({
          ...tempData,
          profilePhoto: profilePhotoBase64
        });
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...updatedUser,
          profilePhoto: profilePhotoBase64
        }));
        
        setIsEditing(false);
        setUpdateMessage('Profile updated successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateMessage(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setUpdateMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (validatePassword()) {
      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:5000/api/auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        
        if (response.data.success) {
          setUpdateMessage('Password changed successfully!');
          setShowChangePassword(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setTimeout(() => setUpdateMessage(''), 3000);
        }
      } catch (err) {
        setUpdateMessage(err.response?.data?.message || 'Failed to change password');
        setTimeout(() => setUpdateMessage(''), 3000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleActionClick = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutModal(false);
    navigate('/SignIn');
  };

  const getDepartmentLabel = (value) => {
    const dept = departments.find(d => d.value === value);
    return dept ? dept.label : value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = [
    { label: 'Room Number', value: profileData.roomNumber, icon: 'bi-door-closed' },
    { label: 'Block', value: profileData.block, icon: 'bi-building' },
    { label: 'Member Since', value: formatDate(profileData.joiningDate), icon: 'bi-calendar' },
    { label: 'Department', value: getDepartmentLabel(profileData.department), icon: 'bi-mortarboard' }
  ];

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getThemeColors = (theme) => {
    const themes = {
      blue: {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        accent: 'bg-blue-500',
        accentLight: 'bg-blue-50',
        textAccent: 'text-blue-600'
      },
      green: {
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        accent: 'bg-green-500',
        accentLight: 'bg-green-50',
        textAccent: 'text-green-600'
      },
      orange: {
        bg: 'from-orange-50 to-orange-100',
        border: 'border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        accent: 'bg-orange-500',
        accentLight: 'bg-orange-50',
        textAccent: 'text-orange-600'
      }
    };
    return themes[theme] || themes.blue;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-exclamation-triangle-fill text-red-600 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SLIIT Uni Stay</h1>
                <p className="text-blue-100 mt-1">Welcome back, {profileData.fullName || 'Student'}!</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm">
                  <i className="bi bi-bell"></i>
                  <span className="text-sm hidden sm:inline">Notifications</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm">
                  <i className="bi bi-question-circle"></i>
                  <span className="text-sm hidden sm:inline">Help</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {updateMessage && (
            <div className={`mb-6 border-l-4 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in shadow-sm ${
              updateMessage.includes('success') || updateMessage.includes('Successfully')
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <i className={`bi ${updateMessage.includes('success') || updateMessage.includes('Successfully') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} text-current`}></i>
              <span className="text-sm font-medium">{updateMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-blue-100 p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className={`${stat.icon} text-blue-600 text-lg`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="font-semibold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-4 border-white shadow-xl mx-auto overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <i className="bi bi-person-fill text-4xl text-white"></i>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-md">
                        <i className="bi bi-camera-fill text-xs"></i>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={tempData.fullName}
                      onChange={handleInputChange}
                      className="mt-3 text-center text-white font-bold text-lg bg-white/20 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  ) : (
                    <h3 className="text-white font-bold text-lg mt-3">{profileData.fullName}</h3>
                  )}
                  <p className="text-blue-100 text-sm">{profileData.itNumber}</p>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 py-2 border-b border-blue-50">
                    <i className="bi bi-envelope-fill text-blue-500 w-5"></i>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={tempData.email}
                        onChange={handleInputChange}
                        className="flex-1 text-sm bg-gray-50 border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{profileData.email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 py-2 border-b border-blue-50">
                    <i className="bi bi-telephone-fill text-blue-500 w-5"></i>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={tempData.phone}
                        onChange={handleInputChange}
                        className="flex-1 text-sm bg-gray-50 border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{profileData.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 py-2 border-b border-blue-50">
                    <i className="bi bi-geo-alt-fill text-blue-500 w-5"></i>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={tempData.address}
                        onChange={handleInputChange}
                        rows="2"
                        className="flex-1 text-sm bg-gray-50 border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{profileData.address || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 py-2">
                    <i className="bi bi-building text-blue-500 w-5"></i>
                    {isEditing ? (
                      <select
                        name="department"
                        value={tempData.department}
                        onChange={handleInputChange}
                        className="flex-1 text-sm bg-gray-50 border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value}>{dept.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm">{getDepartmentLabel(profileData.department)}</span>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-blue-100">
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <i className="bi bi-check-lg"></i>
                        <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <i className="bi bi-x-lg"></i>
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="w-full mt-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 border border-blue-200"
                  >
                    <i className="bi bi-key"></i>
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 border border-red-200"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>

                {showChangePassword && (
                  <div className="p-5 pt-0 border-t border-blue-100 animate-slide-down">
                    <div className="space-y-3">
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Current Password"
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      {passwordErrors.currentPassword && <p className="text-red-500 text-xs">{passwordErrors.currentPassword}</p>}
                      
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="New Password"
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      {passwordErrors.newPassword && <p className="text-red-500 text-xs">{passwordErrors.newPassword}</p>}
                      
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm New Password"
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      {passwordErrors.confirmPassword && <p className="text-red-500 text-xs">{passwordErrors.confirmPassword}</p>}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdatePassword}
                          disabled={isSubmitting}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-all"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setShowChangePassword(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-blue-600 hover:text-blue-700 text-center w-full"
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
                        {showPassword ? 'Hide Password' : 'Show Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                {quickActions.map((action, index) => {
                  const gradients = [
                    'from-blue-500 to-blue-600',
                    'from-indigo-500 to-indigo-600',
                    'from-cyan-500 to-cyan-600',
                    'from-sky-500 to-sky-600'
                  ];
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.route)}
                      className={`group relative overflow-hidden bg-gradient-to-r ${gradients[index % gradients.length]} text-white rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <i className={`${action.icon} text-2xl group-hover:scale-110 transition-transform`}></i>
                        <span className="text-sm font-medium">{action.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
                <div className="border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-clock-history text-blue-600"></i>
                    <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50/30 rounded-lg hover:bg-blue-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className={`${activity.icon} text-blue-600 text-sm`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                            <p className="text-xs text-gray-400">{activity.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusBadge(activity.status)}`}>
                            {activity.status}
                          </span>
                          <button
                            onClick={() => setSelectedActivity(activity)}
                            className="text-xs bg-white border border-blue-300 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium"
                          >
                            <i className="bi bi-eye text-xs"></i>
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
                <div className="flex items-start gap-3">
                  <i className="bi bi-megaphone-fill text-blue-600 text-xl"></i>
                  <div>
                    <h4 className="font-semibold text-blue-800">Important Announcement</h4>
                    <p className="text-sm text-blue-700 mt-1">Room maintenance will be conducted on March 20-22, 2024. Please cooperate with the maintenance team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setSelectedActivity(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-down" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Gradient */}
            <div className={`bg-gradient-to-r ${getThemeColors(selectedActivity.colorTheme).bg} sticky top-0 border-b ${getThemeColors(selectedActivity.colorTheme).border} px-6 py-5`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${getThemeColors(selectedActivity.colorTheme).iconBg} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                    <i className={`${selectedActivity.icon} ${getThemeColors(selectedActivity.colorTheme).iconColor} text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedActivity.action}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Submitted on {selectedActivity.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)} 
                  className="text-gray-400 hover:text-gray-600 bg-white/50 rounded-full w-8 h-8 flex items-center justify-center transition-all hover:bg-white hover:shadow-md"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${getStatusBadge(selectedActivity.status)} shadow-sm`}>
                  <i className="bi bi-circle-fill text-[6px]"></i>
                  {selectedActivity.status}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {selectedActivity.action === 'Room Change Request' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`bg-gradient-to-br ${getThemeColors(selectedActivity.colorTheme).bg} p-4 rounded-xl border ${getThemeColors(selectedActivity.colorTheme).border}`}>
                      <p className="text-xs text-gray-500 mb-1">Request ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">{selectedActivity.details.requestId}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${getThemeColors(selectedActivity.colorTheme).bg} p-4 rounded-xl border ${getThemeColors(selectedActivity.colorTheme).border}`}>
                      <p className="text-xs text-gray-500 mb-1">Priority</p>
                      <p className="text-sm font-semibold text-amber-600">{selectedActivity.details.priority}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Current Room</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.currentRoom}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Requested Room</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.requestedRoom}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Reason for Change</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedActivity.details.reason}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Admin Remark</p>
                    <p className="text-sm text-gray-700">{selectedActivity.details.adminRemark}</p>
                  </div>
                  <div className={`${getThemeColors(selectedActivity.colorTheme).accentLight} p-4 rounded-xl border-l-4 ${getThemeColors(selectedActivity.colorTheme).border}`}>
                    <div className="flex items-center gap-2">
                      <i className={`bi bi-info-circle-fill ${getThemeColors(selectedActivity.colorTheme).textAccent} text-sm`}></i>
                      <p className="text-xs font-medium text-gray-600">Estimated Response Time</p>
                    </div>
                    <p className={`text-sm font-semibold ${getThemeColors(selectedActivity.colorTheme).textAccent} mt-1`}>{selectedActivity.details.estimatedResponse}</p>
                  </div>
                </div>
              )}

              {selectedActivity.action === 'Fee Payment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`bg-gradient-to-br ${getThemeColors(selectedActivity.colorTheme).bg} p-4 rounded-xl border ${getThemeColors(selectedActivity.colorTheme).border}`}>
                      <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">{selectedActivity.details.transactionId}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${getThemeColors(selectedActivity.colorTheme).bg} p-4 rounded-xl border ${getThemeColors(selectedActivity.colorTheme).border}`}>
                      <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">{selectedActivity.details.invoiceNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                      <p className="text-lg font-bold text-green-600">{selectedActivity.details.amount}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Payment Date</p>
                      <p className="text-sm text-gray-700">{new Date(selectedActivity.details.paymentDate).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Payment Gateway</p>
                      <p className="text-sm text-gray-700">{selectedActivity.details.paymentGateway}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Description</p>
                    <p className="text-sm text-gray-700">{selectedActivity.details.description}</p>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                    <i className="bi bi-download"></i>
                    <span className="font-medium">Download Receipt</span>
                  </button>
                </div>
              )}

              {selectedActivity.action === 'Maintenance Request' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`bg-gradient-to-br ${getThemeColors(selectedActivity.colorTheme).bg} p-4 rounded-xl border ${getThemeColors(selectedActivity.colorTheme).border}`}>
                      <p className="text-xs text-gray-500 mb-1">Request ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">{selectedActivity.details.requestId}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${getThemeColors(selectedActivity.colorTheme).bg} p-4 rounded-xl border ${getThemeColors(selectedActivity.colorTheme).border}`}>
                      <p className="text-xs text-gray-500 mb-1">Issue Type</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.issueType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Priority</p>
                      <p className="text-sm font-semibold text-red-600">{selectedActivity.details.priority}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.assignedTo}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Issue Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedActivity.details.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.scheduledDate}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Est. Completion</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedActivity.details.estimatedCompletion}</p>
                    </div>
                  </div>
                  <div className={`${getThemeColors(selectedActivity.colorTheme).accentLight} p-4 rounded-xl border-l-4 ${getThemeColors(selectedActivity.colorTheme).border}`}>
                    <div className="flex items-center gap-2">
                      <i className={`bi bi-arrow-repeat ${getThemeColors(selectedActivity.colorTheme).textAccent} text-sm`}></i>
                      <p className="text-xs font-medium text-gray-600">Last Update</p>
                    </div>
                    <p className={`text-sm font-semibold ${getThemeColors(selectedActivity.colorTheme).textAccent} mt-1`}>{selectedActivity.details.lastUpdate}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className={`px-6 py-2.5 ${getThemeColors(selectedActivity.colorTheme).accent} hover:opacity-90 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg`}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-slide-down">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="bi bi-box-arrow-right text-red-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Confirm Logout</h3>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-all"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default StudentProfile;