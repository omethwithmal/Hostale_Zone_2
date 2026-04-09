import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle, XCircle, Clock, User, Hash, Home as HomeIcon,
  BookOpen, Phone, Mail, FileText, Trash2, Edit, Plus, AlertCircle,
  Check, Ban, X, Search, TrendingUp, MessageSquare, Users
} from 'lucide-react';

const LeaveManagement = ({ darkMode, students }) => {
  // ========== LEAVE REQUESTS STATE ==========
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    studentItNumber: '',
    roomNumber: '',
    block: '',
    department: '',
    contactNumber: '',
    email: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/leaverequests';

  // ========== FETCH DATA FROM BACKEND ==========
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/display`);
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to frontend format
        const transformedRequests = data.data.map(request => ({
          id: request._id,
          studentId: request.studentItNumber,
          studentName: request.studentName,
          studentItNumber: request.studentItNumber,
          roomNumber: request.roomNumber,
          block: request.block,
          department: request.department,
          contactNumber: request.contactNumber,
          email: request.email,
          startDate: request.startDate.split('T')[0],
          endDate: request.endDate.split('T')[0],
          reason: request.reason,
          status: request.status.toLowerCase(),
          rejectionReason: request.rejectionReason || '',
          submittedAt: request.submittedAt || request.createdAt
        }));
        setLeaveRequests(transformedRequests);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      showNotification('Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ========== CRUD OPERATIONS ==========
  const createLeaveRequest = async (requestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchLeaveRequests();
        await fetchStats();
        showNotification('Leave request submitted successfully!', 'success');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      showNotification(error.message || 'Failed to submit leave request', 'error');
      return false;
    }
  };

  const updateLeaveRequest = async (id, requestData) => {
    try {
      // Note: You need to add an update endpoint in your backend
      // For now, we'll create a new one and delete the old
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Delete old request
        await deleteLeaveRequest(id, false);
        await fetchLeaveRequests();
        await fetchStats();
        showNotification('Leave request updated successfully!', 'success');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      showNotification(error.message || 'Failed to update leave request', 'error');
      return false;
    }
  };

  const approveLeaveRequest = async (id, approvedBy = 'Admin') => {
    try {
      const response = await fetch(`${API_BASE_URL}/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvedBy })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchLeaveRequests();
        await fetchStats();
        showNotification(`Leave request approved successfully!`, 'success');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      showNotification(error.message || 'Failed to approve leave request', 'error');
      return false;
    }
  };

  const rejectLeaveRequest = async (id, rejectionReason, rejectedBy = 'Admin') => {
    try {
      const response = await fetch(`${API_BASE_URL}/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason, rejectedBy })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchLeaveRequests();
        await fetchStats();
        showNotification(`Leave request rejected`, 'error');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      showNotification(error.message || 'Failed to reject leave request', 'error');
      return false;
    }
  };

  const deleteLeaveRequest = async (id, showNotif = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchLeaveRequests();
        await fetchStats();
        if (showNotif) {
          showNotification('Leave request deleted successfully!', 'error');
        }
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting leave request:', error);
      if (showNotif) {
        showNotification(error.message || 'Failed to delete leave request', 'error');
      }
      return false;
    }
  };

  // ========== INITIAL DATA LOAD ==========
  useEffect(() => {
    fetchLeaveRequests();
    fetchStats();
  }, []);

  // ========== HELPER FUNCTIONS ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      studentId: '', studentName: '', studentItNumber: '', roomNumber: '',
      block: '', department: '', contactNumber: '', email: '',
      startDate: '', endDate: '', reason: ''
    });
    setEditingRequest(null);
  };

  const handleSelectStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.fullName,
        studentItNumber: student.itNumber,
        roomNumber: student.roomNumber,
        block: student.block,
        department: student.department,
        contactNumber: student.phone,
        email: student.email,
      });
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      showNotification('End date must be after start date', 'error');
      return;
    }

    const requestData = {
      studentName: formData.studentName,
      studentItNumber: formData.studentItNumber,
      roomNumber: formData.roomNumber,
      block: formData.block,
      department: formData.department,
      contactNumber: formData.contactNumber,
      email: formData.email,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason
    };

    let success;
    if (editingRequest) {
      success = await updateLeaveRequest(editingRequest.id, requestData);
    } else {
      success = await createLeaveRequest(requestData);
    }
    
    if (success) {
      resetForm();
      setShowRequestForm(false);
    }
  };

  const handleApprove = async (request) => {
    await approveLeaveRequest(request.id);
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }
    
    await rejectLeaveRequest(showRejectModal.id, rejectionReason);
    setShowRejectModal(null);
    setRejectionReason('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      await deleteLeaveRequest(id);
    }
  };

  const handleEdit = (request) => {
    setFormData({
      studentId: request.studentId,
      studentName: request.studentName,
      studentItNumber: request.studentItNumber,
      roomNumber: request.roomNumber,
      block: request.block,
      department: request.department,
      contactNumber: request.contactNumber,
      email: request.email,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason
    });
    setEditingRequest(request);
    setShowRequestForm(true);
  };

  // Filtered requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.studentItNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1"><Clock size={12} /> Pending</span>;
    }
  };

  // ========== STAT CARD ==========
  const StatCard = ({ title, value, icon: Icon, subtitle }) => (
    <div className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
      darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-blue-100'
    } shadow-lg`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500 opacity-10 blur-2xl"></div>
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{title}</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/25">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // ========== REQUEST CARD ==========
  const RequestCard = ({ request }) => {
    const start = new Date(request.startDate).toLocaleDateString();
    const end = new Date(request.endDate).toLocaleDateString();
    const days = Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    return (
      <div className={`rounded-xl transition-all duration-300 hover:shadow-xl ${
        darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-blue-100'
      } shadow-lg overflow-hidden group`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center ring-2 ring-blue-500/20">
                <User size={22} className="text-blue-500" />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {request.studentName}
                </h3>
                <p className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {request.studentItNumber}
                </p>
              </div>
            </div>
            {getStatusBadge(request.status)}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <HomeIcon size="16" className="text-blue-400" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {request.roomNumber} / {request.block}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen size="16" className="text-blue-400" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {request.department}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size="16" className="text-blue-400" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {request.contactNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size="16" className="text-blue-400" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {request.email}
              </span>
            </div>
          </div>

          <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar size="16" className="text-blue-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {start} → {end}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                {days} day{days !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-start gap-2 mt-2">
              <MessageSquare size="16" className="text-blue-400 mt-0.5" />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex-1`}>
                {request.reason}
              </p>
            </div>
            {request.status === 'rejected' && request.rejectionReason && (
              <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Rejection Reason:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{request.rejectionReason}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(request)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
                >
                  <Check size="16" /> Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(request)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/25"
                >
                  <Ban size="16" /> Reject
                </button>
              </>
            )}
            <button
              onClick={() => handleEdit(request)}
              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
            >
              <Edit size="18" />
            </button>
            <button
              onClick={() => handleDelete(request.id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              <Trash2 size="18" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== REQUEST FORM MODAL ==========
  const RequestFormModal = () => {
    if (!showRequestForm) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-blue-100'} shadow-2xl w-full max-w-3xl mx-4 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto`}>
          <div className="relative bg-blue-500 p-5 sticky top-0">
            <h2 className="text-xl font-bold text-white">
              {editingRequest ? 'Edit Leave Request' : 'New Leave Request'}
            </h2>
            <button
              onClick={() => { resetForm(); setShowRequestForm(false); }}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <X size="20" className="text-white" />
            </button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {!editingRequest && (
                <div className="relative group">
                  <Users size="18" className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    value={formData.studentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} ({student.itNumber}) - {student.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User size="18" className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" name="studentName" value={formData.studentName} readOnly className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-100 dark:bg-gray-800/50 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`} />
                </div>
                <div className="relative group">
                  <Hash size="18" className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" name="studentItNumber" value={formData.studentItNumber} readOnly className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-100 dark:bg-gray-800/50 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`} />
                </div>
                <div className="relative group">
                  <HomeIcon size="18" className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" name="roomNumber" value={formData.roomNumber} readOnly className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-100 dark:bg-gray-800/50 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`} />
                </div>
                <div className="relative group">
                  <BookOpen size="18" className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" name="department" value={formData.department} readOnly className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-100 dark:bg-gray-800/50 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`} />
                </div>
                <div className="relative group">
                  <Phone size="18" className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" name="contactNumber" value={formData.contactNumber} readOnly className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-100 dark:bg-gray-800/50 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`} />
                </div>
                <div className="relative group">
                  <Mail size="18" className="absolute left-3 top-3 text-gray-400" />
                  <input type="email" name="email" value={formData.email} readOnly className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-100 dark:bg-gray-800/50 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Leave Start Date
                  </label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Leave End Date
                  </label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason for Leave
                </label>
                <textarea name="reason" rows="3" value={formData.reason} onChange={handleInputChange} placeholder="Please provide detailed reason for leave..." className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { resetForm(); setShowRequestForm(false); }} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25">
                  {editingRequest ? 'Update Request' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // ========== REJECTION MODAL ==========
  const RejectionModal = () => {
    if (!showRejectModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-red-100'} shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-300`}>
          <div className="relative bg-red-500 p-5">
            <h2 className="text-xl font-bold text-white">Reject Leave Request</h2>
            <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition">
              <X size="20" className="text-white" />
            </button>
          </div>
          
          <div className="p-6">
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Rejecting request for: <strong className="text-red-600">{showRejectModal.studentName}</strong>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows="4"
              className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-red-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
              required
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={handleReject} className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/25">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== NOTIFICATION TOAST ==========
  const NotificationToast = () => {
    if (!notification.show) return null;
    return (
      <div className={`fixed bottom-5 right-5 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {notification.type === 'success' ? <CheckCircle size="20" /> : <AlertCircle size="20" />}
        <span className="text-sm font-medium">{notification.message}</span>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Requests" value={stats.total} icon={FileText} subtitle="All time" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} subtitle="Awaiting action" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} subtitle="Approved requests" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} subtitle="Declined requests" />
      </div>

      {/* Search and Filter Bar */}
      <div className={`rounded-2xl ${darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-blue-100'} shadow-lg overflow-hidden`}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            <div className="relative group">
              <Search size="18" className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or IT number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl border w-64 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={() => { resetForm(); setShowRequestForm(true); }}
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            <Plus size="18" /> New Leave Request
          </button>
        </div>

        {/* Leave Requests Grid */}
        <div className="p-5">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size="64" className="mx-auto text-gray-400 mb-4 opacity-50" />
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>No Leave Requests Found</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click "New Leave Request" to create one</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {sortedRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RequestFormModal />
      <RejectionModal />
      <NotificationToast />
    </div>
  );
};

export default LeaveManagement;