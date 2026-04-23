import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const RoomTransferRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptMessage, setAcceptMessage] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    highPriority: 0
  });
  const [hoveredButton, setHoveredButton] = useState(null);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/roomchange';

  // Fetch all requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch requests from API
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/display`);
      if (response.data && Array.isArray(response.data)) {
        setRequests(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setRequests(response.data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch requests. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Animate stats when requests change
  useEffect(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const highPriority = requests.filter(r => r.priorityLevel === 'Urgent').length;

    let start = 0;
    const timer = setInterval(() => {
      start += 1;
      setAnimatedStats({
        total: Math.min(start, total),
        pending: Math.min(start, pending),
        approved: Math.min(start, approved),
        highPriority: Math.min(start, highPriority)
      });
      if (start >= Math.max(total, pending, approved, highPriority)) {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [requests]);

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Fetch comments for a request
  const fetchComments = async (requestId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comment/${requestId}`);
      if (response.data && Array.isArray(response.data)) {
        setComments(response.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    }
  };

  // Handle approve request
  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      await axios.put(`${API_BASE_URL}/approve/${selectedRequest._id || selectedRequest.id}`, {
        message: acceptMessage
      });
      
      // Update local state
      setRequests(requests.map(req => 
        (req._id === selectedRequest._id || req.id === selectedRequest.id) 
          ? { ...req, status: 'Approved' } 
          : req
      ));
      
      setShowAcceptModal(false);
      setAcceptMessage('');
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again.');
    }
  };

  // Handle reject request
  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    
    try {
      await axios.put(`${API_BASE_URL}/reject/${selectedRequest._id || selectedRequest.id}`, {
        reason: rejectReason
      });
      
      // Update local state
      setRequests(requests.map(req => 
        (req._id === selectedRequest._id || req.id === selectedRequest.id) 
          ? { ...req, status: 'Rejected' } 
          : req
      ));
      
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request. Please try again.');
    }
  };

  // Handle delete request
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/delete/${id}`);
      setRequests(requests.filter(req => req._id !== id && req.id !== id));
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Failed to delete request. Please try again.');
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!selectedRequest || !comment.trim()) return;
    
    try {
      await axios.post(`${API_BASE_URL}/comment`, {
        requestId: selectedRequest._id || selectedRequest.id,
        comment: comment,
        commentedBy: 'Admin' // You can get this from auth context
      });
      
      setComment('');
      fetchComments(selectedRequest._id || selectedRequest.id);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleViewDetails = async (request, index) => {
    setSelectedRequest(request);
    setCurrentViewIndex(index);
    setShowDetailsModal(true);
    await fetchComments(request._id || request.id);
  };

  const handleNext = () => {
    if (currentViewIndex < filteredRequests.length - 1) {
      setCurrentViewIndex(currentViewIndex + 1);
      setSelectedRequest(filteredRequests[currentViewIndex + 1]);
      fetchComments(filteredRequests[currentViewIndex + 1]._id || filteredRequests[currentViewIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentViewIndex > 0) {
      setCurrentViewIndex(currentViewIndex - 1);
      setSelectedRequest(filteredRequests[currentViewIndex - 1]);
      fetchComments(filteredRequests[currentViewIndex - 1]._id || filteredRequests[currentViewIndex - 1].id);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const excelData = filteredRequests.map(req => ({
      'Registration No': req.registrationNumber || req.studentDetails?.registrationNo,
      'Full Name': req.fullName || req.studentDetails?.name,
      'Category': getUserCategory(req),
      'Gender': req.gender || req.studentDetails?.gender,
      'NIC/ID': req.nicIdNumber || req.studentDetails?.nic,
      'Contact Number': req.contactNumber || req.studentDetails?.contact,
      'Email Address': req.emailAddress || req.studentDetails?.email,
      'Current Hostel': req.currentHostelName || req.currentRoom?.hostel,
      'Current Room No': req.currentRoomNumber || req.currentRoom?.roomNo,
      'Current Room Type': req.currentRoomType || req.currentRoom?.type,
      'Preferred Hostel': req.preferredHostel || req.requestedRoom?.hostel,
      'Preferred Room No': req.preferredRoomNumber || req.requestedRoom?.roomNo,
      'Preferred Room Type': req.preferredRoomType || req.requestedRoom?.type,
      'Reason for Change': req.reasonForRequest || req.reason,
      'Priority Level': req.priorityLevel || req.priority,
      'Request Date': req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.date,
      'Status': req.status
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Room Transfer Requests');
    XLSX.writeFile(wb, `Room_Transfer_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper function to get user category
  const getUserCategory = (request) => {
    if (request.userType === 'student-male') return 'Student Male';
    if (request.userType === 'student-female') return 'Student Female';
    if (request.userType === 'staff') return `Staff ${request.gender || ''}`.trim();
    return request.studentDetails?.category || 'Unknown';
  };

  const getPriorityColor = (priority) => {
    const priorityLevel = priority?.toLowerCase?.() || '';
    if (darkMode) {
      switch(priorityLevel) {
        case 'urgent': return 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500';
        case 'high': return 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500';
        case 'medium': return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-yellow-500';
        case 'normal':
        case 'low': return 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-500';
        default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500';
      }
    } else {
      switch(priorityLevel) {
        case 'urgent':
        case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-red-100';
        case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-400 shadow-yellow-100';
        case 'normal':
        case 'low': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-green-100';
        default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400';
      }
    }
  };

  const getStatusColor = (status) => {
    const statusLevel = status?.toLowerCase?.() || '';
    if (darkMode) {
      switch(statusLevel) {
        case 'pending': return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500';
        case 'approved': return 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-500';
        case 'rejected': return 'bg-gradient-to-r from-rose-600 to-rose-700 text-white border-rose-500';
        default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500';
      }
    } else {
      switch(statusLevel) {
        case 'pending': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-100';
        case 'approved': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-100';
        case 'rejected': return 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-400 shadow-rose-100';
        default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400';
      }
    }
  };

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase?.() || '';
    if (darkMode) {
      if (cat.includes('male') && cat.includes('student')) return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500';
      if (cat.includes('female') && cat.includes('student')) return 'bg-gradient-to-r from-pink-600 to-pink-700 text-white border-pink-500';
      if (cat.includes('male') && cat.includes('staff')) return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500';
      if (cat.includes('female') && cat.includes('staff')) return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-500';
      return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500';
    } else {
      if (cat.includes('male') && cat.includes('student')) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-100';
      if (cat.includes('female') && cat.includes('student')) return 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-400 shadow-pink-100';
      if (cat.includes('male') && cat.includes('staff')) return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-purple-100';
      if (cat.includes('female') && cat.includes('staff')) return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 shadow-orange-100';
      return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400';
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const fullName = req.fullName || req.studentDetails?.name || '';
    const regNo = req.registrationNumber || req.studentDetails?.registrationNo || '';
    const nic = req.nicIdNumber || req.studentDetails?.nic || '';
    const email = req.emailAddress || req.studentDetails?.email || '';
    const category = getUserCategory(req);
    const priority = req.priorityLevel || req.priority || '';
    const status = req.status || '';

    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'All' || priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    const matchesCategory = filterCategory === 'All' || category === filterCategory;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <div className={`${
        darkMode 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      } backdrop-blur-sm shadow-sm border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Room Transfer Requests</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage student and staff room transfer applications</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative group"
              >
                <div className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-900 to-purple-900 shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/30'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <svg className={`w-4 h-4 transition-all duration-500 ${
                      darkMode ? 'text-white/30' : 'text-white'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    
                    <svg className={`w-4 h-4 transition-all duration-500 ${
                      darkMode ? 'text-white' : 'text-white/30'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  </div>

                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-all duration-500 ${
                    darkMode 
                      ? 'translate-x-9 bg-gradient-to-r from-indigo-400 to-purple-400' 
                      : 'translate-x-1 bg-gradient-to-r from-yellow-300 to-orange-300'
                  } flex items-center justify-center`}>
                    {darkMode ? (
                      <svg className="w-3 h-3 text-indigo-900" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <span className={`text-xs py-1 px-2 rounded ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-white'
                  }`}>
                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </span>
                </div>
              </button>

              <button
                onClick={handleGoToDashboard}
                className="group flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={fetchRequests}
                className="p-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchRequests}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Requests Card */}
              <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="relative p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-bl-full"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 dark:text-indigo-400 px-3 py-1 rounded-full">Total</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>All Requests</p>
                    <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.total}</p>
                    <p className={`text-xs flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      From database
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending Card */}
              <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="relative p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-bl-full"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1 rounded-full">Pending</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Awaiting Review</p>
                    <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.pending}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Need attention</p>
                  </div>
                </div>
              </div>

              {/* Approved Card */}
              <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="relative p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-emerald-500/20 rounded-bl-full"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 dark:text-emerald-400 px-3 py-1 rounded-full">Approved</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Successfully Approved</p>
                    <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.approved}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Ready for processing</p>
                  </div>
                </div>
              </div>

              {/* High Priority Card */}
              <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="relative p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-rose-500/20 rounded-bl-full"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/50 dark:text-rose-400 px-3 py-1 rounded-full">Urgent</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>High Priority</p>
                    <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.highPriority}</p>
                    <p className={`text-xs flex items-center ${darkMode ? 'text-rose-400' : 'text-rose-500'}`}>
                      <span className="inline-block w-2 h-2 bg-rose-500 rounded-full mr-1 animate-pulse"></span>
                      Requires immediate action
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className={`rounded-2xl shadow-lg border p-6 mb-8 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search Students/Staff
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search by name, reg no, NIC, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-200'
                      }`}
                    />
                    <svg className={`w-5 h-5 absolute left-3 top-3.5 transition-colors ${
                      darkMode ? 'text-gray-500 group-hover:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category Filter
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-200'
                    }`}
                  >
                    <option value="All" className={darkMode ? 'bg-gray-700' : ''}>All Categories</option>
                    <option value="Student Male" className={darkMode ? 'bg-gray-700' : ''}>Student Male</option>
                    <option value="Student Female" className={darkMode ? 'bg-gray-700' : ''}>Student Female</option>
                    <option value="Staff Male" className={darkMode ? 'bg-gray-700' : ''}>Staff Male</option>
                    <option value="Staff Female" className={darkMode ? 'bg-gray-700' : ''}>Staff Female</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority Filter
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-200'
                    }`}
                  >
                    <option value="All" className={darkMode ? 'bg-gray-700' : ''}>All Priorities</option>
                    <option value="Urgent" className={darkMode ? 'bg-gray-700' : ''}>Urgent</option>
                    <option value="High" className={darkMode ? 'bg-gray-700' : ''}>High</option>
                    <option value="Medium" className={darkMode ? 'bg-gray-700' : ''}>Medium</option>
                    <option value="Normal" className={darkMode ? 'bg-gray-700' : ''}>Normal</option>
                    <option value="Low" className={darkMode ? 'bg-gray-700' : ''}>Low</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status Filter
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-200'
                    }`}
                  >
                    <option value="All" className={darkMode ? 'bg-gray-700' : ''}>All Status</option>
                    <option value="Pending" className={darkMode ? 'bg-gray-700' : ''}>Pending</option>
                    <option value="Approved" className={darkMode ? 'bg-gray-700' : ''}>Approved</option>
                    <option value="Rejected" className={darkMode ? 'bg-gray-700' : ''}>Rejected</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={exportToExcel}
                    className="group w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-2 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-4 flex flex-wrap gap-2">
                {filterCategory !== 'All' && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(filterCategory)}`}>
                    {filterCategory}
                    <button onClick={() => setFilterCategory('All')} className="ml-2 hover:text-white/80">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filterPriority !== 'All' && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(filterPriority)}`}>
                    {filterPriority} Priority
                    <button onClick={() => setFilterPriority('All')} className="ml-2 hover:text-white/80">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filterStatus !== 'All' && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(filterStatus)}`}>
                    {filterStatus}
                    <button onClick={() => setFilterStatus('All')} className="ml-2 hover:text-white/80">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-gray-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Table */}
            <div className={`rounded-2xl shadow-xl border overflow-hidden ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-xl w-12">#</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Student/Staff Details</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Category</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Contact Info</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Current Room</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Requested Room</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Reason</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Priority</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {filteredRequests.map((request, index) => (
                      <tr 
                        key={request._id || request.id || index} 
                        className={`group hover:bg-gradient-to-r transition-all duration-300 ${
                          darkMode 
                            ? 'hover:from-gray-700 hover:to-gray-600' 
                            : 'hover:from-indigo-50 hover:to-purple-50'
                        }`}
                      >
                        <td className="px-3 py-5 align-top">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-medium transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-400 group-hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-600 group-hover:bg-white'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        
                        {/* Student/Staff Details */}
                        <td className="px-3 py-5 align-top">
                          <div className="space-y-2">
                            <div className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {request.fullName || request.studentDetails?.name || 'N/A'}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md ${
                                darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'
                              }`}>
                                <svg className={`w-3 h-3 mr-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                <span className={`text-xs ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                  {request.registrationNumber || request.studentDetails?.registrationNo || 'N/A'}
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md ${
                                darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                              }`}>
                                <svg className={`w-3 h-3 mr-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                <span className={`text-xs ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                                  {request.nicIdNumber || request.studentDetails?.nic || 'N/A'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Category Column */}
                        <td className="px-3 py-5 align-top">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium shadow-md ${getCategoryColor(getUserCategory(request))}`}>
                            {request.gender === 'Male' || request.studentDetails?.gender === 'Male' ? (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                              </svg>
                            )}
                            {getUserCategory(request)}
                          </span>
                          {request.faculty && (
                            <div className="mt-1 text-xs text-gray-500">
                              {request.faculty}
                            </div>
                          )}
                          {request.department && (
                            <div className="mt-1 text-xs text-gray-500">
                              {request.department}
                            </div>
                          )}
                        </td>
                        
                        {/* Contact Info */}
                        <td className="px-3 py-5 align-top">
                          <div className="space-y-2">
                            <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <svg className={`w-3 h-3 mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{request.contactNumber || request.studentDetails?.contact || 'N/A'}</span>
                            </div>
                            <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <svg className={`w-3 h-3 mr-1 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="break-all text-xs">{request.emailAddress || request.studentDetails?.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Current Room */}
                        <td className="px-3 py-5 align-top">
                          <div className={`p-2 rounded-lg border transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 group-hover:bg-gray-600' 
                              : 'bg-gray-50 border-gray-200 group-hover:bg-white'
                          }`}>
                            <div className={`font-medium text-xs mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {request.currentHostelName || request.currentRoom?.hostel || 'N/A'}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center text-xs">
                                <span className={`w-12 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Room:</span>
                                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {request.currentRoomNumber || request.currentRoom?.roomNo || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center text-xs">
                                <span className={`w-12 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Type:</span>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {request.currentRoomType || request.currentRoom?.type || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Requested Room */}
                        <td className="px-3 py-5 align-top">
                          <div className={`p-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-indigo-900/20 border-indigo-800' 
                              : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                          }`}>
                            <div className={`font-medium text-xs mb-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
                              {request.preferredHostel || request.requestedRoom?.hostel || 'N/A'}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center text-xs">
                                <span className={`w-12 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Room:</span>
                                <span className={`font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                                  {request.preferredRoomNumber || request.requestedRoom?.roomNo || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center text-xs">
                                <span className={`w-12 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Type:</span>
                                <span className={`${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                                  {request.preferredRoomType || request.requestedRoom?.type || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Reason */}
                        <td className="px-3 py-5 align-top">
                          <div className="max-w-xs">
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {request.reasonForRequest || request.reason || 'N/A'}
                            </p>
                          </div>
                        </td>
                        
                        {/* Priority */}
                        <td className="px-3 py-5 align-top">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shadow-md ${getPriorityColor(request.priorityLevel || request.priority)}`}>
                            {request.priorityLevel || request.priority || 'Normal'}
                          </span>
                        </td>
                        
                        {/* Date */}
                        <td className="px-3 py-5 align-top">
                          <div className={`inline-flex items-center px-2 py-1 rounded-lg ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <svg className={`w-3 h-3 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : request.date || 'N/A'}
                            </span>
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-3 py-5 align-top">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shadow-md ${getStatusColor(request.status)}`}>
                            {request.status || 'Pending'}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-3 py-5 align-top">
                          <div className="flex items-center space-x-1">
                            {/* View Details Button */}
                            <div className="relative">
                              <button
                                onClick={() => handleViewDetails(request, index)}
                                onMouseEnter={() => setHoveredButton(`view-${request._id || request.id}`)}
                                onMouseLeave={() => setHoveredButton(null)}
                                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              
                              {/* Tooltip */}
                              {hoveredButton === `view-${request._id || request.id}` && (
                                <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 animate-fadeIn">
                                  View Details
                                </div>
                              )}
                            </div>

                            {request.status === 'Pending' && (
                              <>
                                {/* Approve Button */}
                                <div className="relative">
                                  <button
                                    onClick={() => handleApprove(request)}
                                    onMouseEnter={() => setHoveredButton(`approve-${request._id || request.id}`)}
                                    onMouseLeave={() => setHoveredButton(null)}
                                    className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                                    title="Approve Request"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  
                                  {/* Tooltip */}
                                  {hoveredButton === `approve-${request._id || request.id}` && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 animate-fadeIn">
                                      Approve Request
                                    </div>
                                  )}
                                </div>

                                {/* Reject Button */}
                                <div className="relative">
                                  <button
                                    onClick={() => handleReject(request)}
                                    onMouseEnter={() => setHoveredButton(`reject-${request._id || request.id}`)}
                                    onMouseLeave={() => setHoveredButton(null)}
                                    className="p-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                                    title="Reject Request"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  
                                  {/* Tooltip */}
                                  {hoveredButton === `reject-${request._id || request.id}` && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 animate-fadeIn">
                                      Reject Request
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            
                            {/* Delete Button */}
                            <div className="relative">
                              <button
                                onClick={() => handleDelete(request._id || request.id)}
                                onMouseEnter={() => setHoveredButton(`delete-${request._id || request.id}`)}
                                onMouseLeave={() => setHoveredButton(null)}
                                className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                                title="Delete Request"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              
                              {/* Tooltip */}
                              {hoveredButton === `delete-${request._id || request.id}` && (
                                <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 animate-fadeIn">
                                  Delete Request
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredRequests.length === 0 && !loading && (
                <div className="text-center py-16 animate-fadeIn">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No requests found</p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* View Details Modal with Comments */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`rounded-2xl max-w-4xl w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-2xl`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'bg-indigo-900/30 border-indigo-800' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
            }`}>
              <h3 className={`text-xl font-semibold flex items-center ${
                darkMode ? 'text-indigo-300' : 'text-indigo-800'
              }`}>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detailed Request Information
              </h3>
              
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentViewIndex + 1} of {filteredRequests.length}
                </span>
                <button
                  onClick={handlePrevious}
                  disabled={currentViewIndex === 0}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    currentViewIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-white text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentViewIndex === filteredRequests.length - 1}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    currentViewIndex === filteredRequests.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-white text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-white text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-start">
                    <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-md ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>

                  {/* Personal Information */}
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.fullName || selectedRequest.studentDetails?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Registration No</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.registrationNumber || selectedRequest.studentDetails?.registrationNo || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>NIC/ID</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.nicIdNumber || selectedRequest.studentDetails?.nic || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gender</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.gender || selectedRequest.studentDetails?.gender || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact Number</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.contactNumber || selectedRequest.studentDetails?.contact || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</p>
                          <p className={`font-medium break-all ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.emailAddress || selectedRequest.studentDetails?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {selectedRequest.userType === 'staff' && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Staff ID</p>
                              <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {selectedRequest.staffId || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</p>
                              <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {selectedRequest.department || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Designation</p>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {selectedRequest.designation || 'N/A'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Room Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className={`p-4 rounded-xl ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                        darkMode ? 'text-indigo-400' : 'text-indigo-700'
                      }`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Current Room
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hostel</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.currentHostelName || selectedRequest.currentRoom?.hostel || 'N/A'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room Number</p>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {selectedRequest.currentRoomNumber || selectedRequest.currentRoom?.roomNo || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room Type</p>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {selectedRequest.currentRoomType || selectedRequest.currentRoom?.type || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl ${
                      darkMode ? 'bg-indigo-900/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
                    }`}>
                      <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                        darkMode ? 'text-indigo-300' : 'text-indigo-700'
                      }`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Requested Room
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hostel</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {selectedRequest.preferredHostel || selectedRequest.requestedRoom?.hostel || 'N/A'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room Number</p>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {selectedRequest.preferredRoomNumber || selectedRequest.requestedRoom?.roomNo || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room Type</p>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {selectedRequest.preferredRoomType || selectedRequest.requestedRoom?.type || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Reason for Change */}
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Reason for Room Change
                    </h4>
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-600' : 'bg-white'
                    }`}>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                        {selectedRequest.reasonForRequest || selectedRequest.reason || 'N/A'}
                      </p>
                      {selectedRequest.otherReason && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-500">
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Additional Details:</p>
                          <p className={darkMode ? 'text-gray-300' : 'text-gray-800'}>{selectedRequest.otherReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Priority and Date */}
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Request Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Priority Level</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium mt-1 ${getPriorityColor(selectedRequest.priorityLevel || selectedRequest.priority)}`}>
                          {selectedRequest.priorityLevel || selectedRequest.priority || 'Normal'}
                        </span>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Request Date</p>
                        <p className={`font-medium mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : selectedRequest.date || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comments ({comments.length})
                    </h4>
                    
                    {/* Comments List */}
                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                      {comments.length > 0 ? (
                        comments.map((comment, idx) => (
                          <div key={idx} className={`p-3 rounded-lg ${
                            darkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-xs font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                                {comment.commentedBy || 'Admin'}
                              </span>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(comment.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {comment.comment}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No comments yet
                        </p>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'border-gray-300'
                        }`}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                          !comment.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex justify-between items-center ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2">
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleApprove(selectedRequest);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleReject(selectedRequest);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-2xl max-w-md w-full mx-4 overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`px-6 py-4 border-b ${
              darkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
            }`}>
              <h3 className={`text-lg font-semibold flex items-center ${
                darkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Approve Transfer Request
              </h3>
            </div>
            
            <div className="p-6">
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                You are approving transfer request from <span className="font-semibold">{selectedRequest.fullName || selectedRequest.studentDetails?.name}</span>
              </p>
              
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Message to Applicant (Optional)
              </label>
              <textarea
                value={acceptMessage}
                onChange={(e) => setAcceptMessage(e.target.value)}
                rows="4"
                placeholder="Add any additional message or instructions..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
              />
            </div>
            
            <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setAcceptMessage('');
                }}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-2xl max-w-md w-full mx-4 overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`px-6 py-4 border-b ${
              darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`text-lg font-semibold flex items-center ${
                darkMode ? 'text-red-300' : 'text-red-800'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Transfer Request
              </h3>
            </div>
            
            <div className="p-6">
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                You are rejecting transfer request from <span className="font-semibold">{selectedRequest.fullName || selectedRequest.studentDetails?.name}</span>
              </p>
              
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for rejection..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors ${
                  rejectReason.trim() ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#f1f1f1'};
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4B5563' : '#888'};
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6B7280' : '#555'};
        }
      `}</style>
    </div>
  );
};

export default RoomTransferRequest;