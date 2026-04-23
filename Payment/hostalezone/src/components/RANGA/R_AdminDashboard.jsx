import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import {
  Users, UserCheck, UserX, GraduationCap, Plus, Edit, Trash2, Search,
  Download, Moon, Sun, Calendar, Home, FileText,
  ChevronRight, ChevronLeft, X, AlertCircle, CheckCircle,
  TrendingUp, Bell, UserPlus, CreditCard,
  Mail, Phone, MapPin, Hash, BookOpen, Home as HomeIcon, Grid,
  Sparkles, Eye, UserCircle, RefreshCw
} from 'lucide-react';
import LeaveManagement from './R_AdminLeaveManagement';
import PaymentManagementDashboard from '../Payment/PaymentManagementDashboard';

const StudentManagementDashboard = ({ initialSection = 'students' }) => {
  // ========== THEME STATE ==========
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ========== STUDENT DATA FROM BACKEND ==========
  const [students, setStudents] = useState([]);

  // ========== FETCH STUDENTS FROM BACKEND ==========
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Transform backend data to match frontend format
        const formattedStudents = response.data.users.map((user, index) => ({
          id: user.id || user._id || index.toString(),
          itNumber: user.itNumber,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          address: user.address,
          profilePhoto: user.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
          roomNumber: user.roomNumber || 'Not Assigned',
          block: user.block || 'Tower A',
          memberSince: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: user.isActive ? 'active' : 'blocked',
          userType: user.userType
        }));
        setStudents(formattedStudents);
        showNotification('Students loaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Failed to load students from server', 'error');
      // Load sample data if backend fails
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // ========== SAMPLE DATA (Fallback) ==========
  const loadSampleData = () => {
    const sampleStudents = [
      {
        id: '1',
        itNumber: 'IT2023001',
        fullName: 'Amal Perera',
        email: 'amal.perera@example.com',
        phone: '+94 71 234 5678',
        department: 'Computer Science',
        address: 'No. 123, Galle Road, Colombo 03',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        roomNumber: 'A-101',
        block: 'Tower A',
        memberSince: '2023-01-15',
        status: 'active'
      },
      {
        id: '2',
        itNumber: 'IT2023002',
        fullName: 'Nimali Fernando',
        email: 'nimali.fernando@example.com',
        phone: '+94 72 345 6789',
        department: 'Information Systems',
        address: 'No. 45, Kandy Road, Kandy',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        roomNumber: 'B-202',
        block: 'Tower B',
        memberSince: '2023-02-20',
        status: 'active'
      },
      {
        id: '3',
        itNumber: 'IT2023003',
        fullName: 'Kasun Bandara',
        email: 'kasun.bandara@example.com',
        phone: '+94 73 456 7890',
        department: 'Software Engineering',
        address: 'No. 78, Main Street, Galle',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        roomNumber: 'C-303',
        block: 'Tower C',
        memberSince: '2023-03-10',
        status: 'blocked'
      }
    ];
    setStudents(sampleStudents);
  };

  // ========== REGISTER STUDENT TO BACKEND ==========
  const registerStudent = async (studentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/register', studentData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        showNotification('Student registered successfully!', 'success');
        fetchStudents(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error registering student:', error);
      showNotification(error.response?.data?.message || 'Registration failed', 'error');
      return false;
    }
  };

  // ========== UPDATE STUDENT IN BACKEND ==========
  const updateStudent = async (id, studentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/auth/user/${id}`, studentData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        showNotification('Student updated successfully!', 'success');
        fetchStudents(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error updating student:', error);
      showNotification(error.response?.data?.message || 'Update failed', 'error');
      return false;
    }
  };

  // ========== DELETE STUDENT FROM BACKEND ==========
  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/auth/user/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        showNotification('Student deleted successfully!', 'success');
        fetchStudents(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      showNotification(error.response?.data?.message || 'Delete failed', 'error');
      return false;
    }
  };

  // ========== INITIAL FETCH ==========
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const [formData, setFormData] = useState({
    itNumber: '', fullName: '', email: '', phone: '', department: '',
    address: '', profilePhoto: '', roomNumber: '', block: '',
    memberSince: new Date().toISOString().split('T')[0], status: 'active'
  });

  // ========== STATISTICS ==========
  const totalStudents = students.length;
  const activeAccounts = students.filter(s => s.status === 'active').length;
  const blockedAccounts = students.filter(s => s.status === 'blocked').length;
  const departments = [...new Set(students.map(s => s.department))];

  // ========== FILTERED STUDENTS ==========
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.itNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter ? student.department === departmentFilter : true;
    const matchesStatus = statusFilter ? student.status === statusFilter : true;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const resetForm = () => {
    setFormData({
      itNumber: '', fullName: '', email: '', phone: '', department: '',
      address: '', profilePhoto: '', roomNumber: '', block: '',
      memberSince: new Date().toISOString().split('T')[0], status: 'active'
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    
    if (editingId) {
      success = await updateStudent(editingId, formData);
    } else {
      success = await registerStudent(formData);
    }
    
    if (success) {
      resetForm();
      setShowRegisterForm(false);
    }
  };

  const handleEdit = (student) => {
    setFormData(student);
    setEditingId(student.id);
    setShowRegisterForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(id);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredStudents.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Excel file downloaded!', 'success');
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // ========== STAT CARD COMPONENT ==========
  const StatCard = ({ title, value, icon: Icon, trend, subtitle }) => (
    <div 
      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
        darkMode 
          ? 'bg-gray-800/80 border border-gray-700' 
          : 'bg-white border border-blue-100'
      } shadow-lg`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500 opacity-10 blur-2xl"></div>
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{title}</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
            {trend && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> +{trend}% from last month
              </p>
            )}
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/25">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // ========== SIDEBAR ==========
  const Sidebar = () => (
    <div className={`h-screen sticky top-0 transition-all duration-500 ${sidebarCollapsed ? 'w-20' : 'w-72'} ${
      darkMode ? 'bg-gray-900/95 border-r border-gray-800' : 'bg-white/95 border-r border-blue-100'
    } shadow-xl flex flex-col z-20`}>
      <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                <HomeIcon size={20} className="text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Hostel Zone</h1>
          </div>
        )}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <SidebarItem 
          icon={<UserCircle size={20} />} 
          label="Student Details" 
          active={activeSection === 'students'} 
          onClick={() => { 
            setActiveSection('students'); 
            setShowRegisterForm(false); 
            fetchStudents();
          }} 
          collapsed={sidebarCollapsed} 
        />
        
        <SidebarItem 
          icon={<Calendar size={20} />} 
          label="Leave Management" 
          active={activeSection === 'leave'} 
          onClick={() => {
            setActiveSection('leave');
            setShowRegisterForm(false);
          }} 
          collapsed={sidebarCollapsed} 
        />
        
        <SidebarItem 
          icon={<CreditCard size={20} />} 
          label="Payment Management" 
          active={activeSection === 'payments'} 
          onClick={() => {
            setActiveSection('payments');
            setShowRegisterForm(false);
          }} 
          collapsed={sidebarCollapsed} 
        />
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
          {!sidebarCollapsed && <span className="ml-3 text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <div className={`flex items-center ${!sidebarCollapsed ? 'p-3' : 'justify-center'} rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">A</div>
          {!sidebarCollapsed && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, active, onClick, collapsed }) => (
    <button 
      onClick={onClick} 
      className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <div className="relative">
        {icon}
        {active && <div className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>}
      </div>
      {!collapsed && <span className="ml-3 text-sm font-medium">{label}</span>}
    </button>
  );

  // ========== REGISTRATION FORM (Popup Modal) ==========
  const RegistrationModal = () => {
    if (!showRegisterForm) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-blue-100'} shadow-2xl w-full max-w-3xl mx-4 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto`}>
          <div className="relative bg-blue-500 p-5 sticky top-0">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Student' : 'Register New Student'}</h2>
            <button onClick={() => { resetForm(); setShowRegisterForm(false); }} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition">
              <X size={20} className="text-white" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Hash size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="itNumber" placeholder="IT Number" value={formData.itNumber} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
                <div className="relative group">
                  <Users size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
                <div className="relative group">
                  <Mail size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
                <div className="relative group">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
                <div className="relative group">
                  <BookOpen size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} required />
                </div>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div className="relative group">
                  <HomeIcon size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="roomNumber" placeholder="Room Number" value={formData.roomNumber} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div className="relative group">
                  <Grid size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="block" placeholder="Block" value={formData.block} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <input type="date" name="memberSince" value={formData.memberSince} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                <select name="status" value={formData.status} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { resetForm(); setShowRegisterForm(false); }} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25">
                  {editingId ? 'Update Student' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // ========== STUDENT TABLE ==========
  const StudentTable = () => (
    <div className={`rounded-2xl ${darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-blue-100'} shadow-lg overflow-hidden`}>
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3 flex-wrap">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-10 pr-4 py-2 rounded-xl border w-64 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`} />
          </div>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={`px-4 py-2 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`px-4 py-2 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <button onClick={fetchStudents} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
        <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25">
          <Download size={18} /> Export Excel
        </button>
      </div>
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading students...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Student</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Department</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Location</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map(student => (
                <tr key={student.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer" onClick={() => viewStudentDetails(student)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.profilePhoto} alt={student.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20" />
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-xs text-gray-400">Since {new Date(student.memberSince).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm">{student.itNumber}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm">{student.email}</p>
                    <p className="text-xs text-gray-400">{student.phone}</p>
                  </td>
                  <td className="px-5 py-4">{student.department}</td>
                  <td className="px-5 py-4">{student.roomNumber} / {student.block}</td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {student.status === 'active' ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(student)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(student.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"><Trash2 size={16} /></button>
                      <button onClick={() => viewStudentDetails(student)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ========== STUDENT DETAIL MODAL ==========
  const StudentDetailModal = () => {
    if (!showDetailModal || !selectedStudent) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-blue-100'} shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in zoom-in-95 duration-300`}>
          <div className="relative bg-blue-500 p-6">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition">
              <X size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-4">
              <img src={selectedStudent.profilePhoto} alt={selectedStudent.fullName} className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30" />
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedStudent.fullName}</h2>
                <p className="text-white/80">{selectedStudent.itNumber}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium">{selectedStudent.email}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium">{selectedStudent.phone}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">Department</p>
                <p className="text-sm font-medium">{selectedStudent.department}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm font-medium">{selectedStudent.address}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">Room / Block</p>
                <p className="text-sm font-medium">{selectedStudent.roomNumber} / {selectedStudent.block}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">Member Since</p>
                <p className="text-sm font-medium">{new Date(selectedStudent.memberSince).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { handleEdit(selectedStudent); setShowDetailModal(false); }} className="px-5 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/25">Edit Student</button>
              <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== NOTIFICATION ==========
  const NotificationToast = () => {
    if (!notification.show) return null;
    return (
      <div className={`fixed bottom-5 right-5 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="text-sm font-medium">{notification.message}</span>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'} transition-all duration-500`}>
        <div className="flex relative">
          <Sidebar />
          <main className="flex-1">
            {/* Top Bar */}
            <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900/80 border-b border-gray-800' : 'bg-white/80 border-b border-blue-100'} backdrop-blur-md shadow-sm p-5 flex justify-between items-center`}>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {activeSection === 'students' && 'Student Details'}
                  {activeSection === 'leave' && 'Leave Management'}
                  {activeSection === 'payments' && 'Payment Management'}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 flex items-center gap-1`}>
                  <Sparkles size={12} className="text-blue-500" />
                  {activeSection === 'students' && 'Manage and view all student information from database'}
                  {activeSection === 'leave' && 'Track and manage student leave requests'}
                  {activeSection === 'payments' && 'Control billing, payment approval, late fees, and reports'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">A</div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activeSection === 'students' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard title="Total Students" value={totalStudents} icon={Users} trend="12" subtitle="From database" />
                    <StatCard title="Active Accounts" value={activeAccounts} icon={UserCheck} trend="8" subtitle={`${Math.round((activeAccounts/totalStudents)*100)}% of total`} />
                    <StatCard title="Blocked Accounts" value={blockedAccounts} icon={UserX} subtitle="Needs review" />
                    <StatCard title="Departments" value={departments.length} icon={GraduationCap} subtitle="Active programs" />
                  </div>

                  {/* Add New Student Button */}
                  <div className="flex justify-end">
                    <button onClick={() => { setShowRegisterForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25">
                      <UserPlus size={18} /> Register New Student
                    </button>
                  </div>

                  {/* Student Table */}
                  <StudentTable />
                </div>
              )}
              {activeSection === 'leave' && <LeaveManagement darkMode={darkMode} students={students} />}
              {activeSection === 'payments' && <PaymentManagementDashboard darkMode={darkMode} students={students} />}
            </div>
          </main>
        </div>
        <RegistrationModal />
        <StudentDetailModal />
        <NotificationToast />
      </div>
    </div>
  );
};

export default StudentManagementDashboard;
