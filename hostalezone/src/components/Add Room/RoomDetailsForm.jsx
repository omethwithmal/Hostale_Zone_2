import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const RoomDetailsForm = () => {
  const [roomData, setRoomData] = useState({
    monthlyPrice: '',
    roomNumber: '',
    roomType: 'single',
    maxOccupancy: '',
    floorNumber: '',
    size: '',
    description: '',
    availableFrom: '',
    availableTo: '',
    status: 'available',
    amenities: {
      privateBathroom: false,
      airConditioning: false,
      highSpeedWifi: false,
      studyDesks: 0,
      storageLockers: false,
      miniFridge: false,
      tv: false,
      balcony: false,
      microwave: false,
      washingMachine: false,
      waterHeater: false,
      parking: false
    }
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // New state for file objects
  
  // Rooms data - will be fetched from backend
  const [rooms, setRooms] = useState([]);
  
  // Filtered rooms for search and date filtering
  const [filteredRooms, setFilteredRooms] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterType, setFilterType] = useState('all'); // 'all', 'year', 'month', 'week'

  const [editingId, setEditingId] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Animation states
  const [animatedStats, setAnimatedStats] = useState({
    available: 0,
    occupied: 0,
    maintenance: 0,
    unavailable: 0,
    total: 0,
    occupancyRate: 0
  });

  // Chart animation states
  const [chartAnimation, setChartAnimation] = useState({
    donutProgress: 0,
    barProgress: 0,
    trendProgress: 0
  });

  // Base URL for API
  const API_BASE_URL = 'http://localhost:5000/roomdetails';

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch all rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Apply filters when rooms, searchTerm, dateFilter, or filterType changes
  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, dateFilter, filterType]);

  // Animate counts and charts when rooms data changes
  useEffect(() => {
    if (rooms.length > 0) {
      const available = rooms.filter(room => room.status === 'available').length;
      const occupied = rooms.filter(room => room.status === 'occupied').length;
      const maintenance = rooms.filter(room => room.status === 'maintenance').length;
      const unavailable = rooms.filter(room => room.status === 'unavailable').length;
      const total = rooms.length;
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      animateNumbers({
        available,
        occupied,
        maintenance,
        unavailable,
        total,
        occupancyRate
      });

      animateCharts();
    }
  }, [rooms]);

  // Apply filters function
  const applyFilters = () => {
    let filtered = [...rooms];

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.floorNumber?.toString().includes(searchTerm) ||
        room.monthlyPrice?.toString().includes(searchTerm)
      );
    }

    if (dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter(room => {
        const availableFrom = room.availableFrom ? new Date(room.availableFrom) : null;
        const filterStart = new Date(dateFilter.startDate);
        const filterEnd = new Date(dateFilter.endDate);
        
        return availableFrom && availableFrom >= filterStart && availableFrom <= filterEnd;
      });
    }

    if (filterType !== 'all') {
      const now = new Date();
      filtered = filtered.filter(room => {
        const availableFrom = room.availableFrom ? new Date(room.availableFrom) : null;
        if (!availableFrom) return false;

        const diffTime = Math.abs(now - availableFrom);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch(filterType) {
          case 'year':
            return diffDays <= 365;
          case 'month':
            return diffDays <= 30;
          case 'week':
            return diffDays <= 7;
          default:
            return true;
        }
      });
    }

    setFilteredRooms(filtered);
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      const exportData = filteredRooms.map((room, index) => ({
        '#': index + 1,
        'Room Number': room.roomNumber,
        'Monthly Price (Rs.)': room.monthlyPrice,
        'Room Type': room.roomType,
        'Floor Number': room.floorNumber,
        'Size (sq ft)': room.size,
        'Max Occupancy': room.maxOccupancy,
        'Status': room.status,
        'Available From': room.availableFrom ? new Date(room.availableFrom).toLocaleDateString() : 'N/A',
        'Available To': room.availableTo ? new Date(room.availableTo).toLocaleDateString() : 'N/A',
        'Private Bathroom': room.amenities?.privateBathroom ? 'Yes' : 'No',
        'Air Conditioning': room.amenities?.airConditioning ? 'Yes' : 'No',
        'High Speed WiFi': room.amenities?.highSpeedWifi ? 'Yes' : 'No',
        'Study Desks': room.amenities?.studyDesks || 0,
        'Storage Lockers': room.amenities?.storageLockers ? 'Yes' : 'No',
        'Mini Fridge': room.amenities?.miniFridge ? 'Yes' : 'No',
        'TV': room.amenities?.tv ? 'Yes' : 'No',
        'Balcony': room.amenities?.balcony ? 'Yes' : 'No',
        'Microwave': room.amenities?.microwave ? 'Yes' : 'No',
        'Washing Machine': room.amenities?.washingMachine ? 'Yes' : 'No',
        'Water Heater': room.amenities?.waterHeater ? 'Yes' : 'No',
        'Parking': room.amenities?.parking ? 'Yes' : 'No'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Room Details');
      
      const date = new Date();
      const fileName = `room_details_${date.toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      setSuccess('Excel file downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error exporting to Excel: ' + err.message);
    }
  };

  const animateNumbers = (targetValues) => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        available: Math.min(Math.round(targetValues.available * progress), targetValues.available),
        occupied: Math.min(Math.round(targetValues.occupied * progress), targetValues.occupied),
        maintenance: Math.min(Math.round(targetValues.maintenance * progress), targetValues.maintenance),
        unavailable: Math.min(Math.round(targetValues.unavailable * progress), targetValues.unavailable),
        total: Math.min(Math.round(targetValues.total * progress), targetValues.total),
        occupancyRate: Math.min(Math.round(targetValues.occupancyRate * progress), targetValues.occupancyRate)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(targetValues);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  };

  const animateCharts = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setChartAnimation({
        donutProgress: Math.min(progress, 1),
        barProgress: Math.min(progress, 1),
        trendProgress: Math.min(progress, 1)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setChartAnimation({
          donutProgress: 1,
          barProgress: 1,
          trendProgress: 1
        });
      }
    }, stepDuration);
  };

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/display`);
      setRooms(response.data);
      setFilteredRooms(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching rooms: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'monthlyPrice') {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        setValidationErrors(prev => ({
          ...prev,
          monthlyPrice: 'Price cannot be negative'
        }));
        return;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.monthlyPrice;
          return newErrors;
        });
      }
    }

    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAmenityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: type === 'checkbox' ? checked : parseInt(value) || 0
      }
    }));
  };

  // FIXED: Handle image upload properly
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Store the actual file objects for upload
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  // FIXED: Remove image properly
  const removeImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    
    // Remove from files and previews
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (!roomData.roomNumber) {
      errors.roomNumber = 'Room number is required';
    }
    if (!roomData.monthlyPrice) {
      errors.monthlyPrice = 'Monthly price is required';
    } else if (parseFloat(roomData.monthlyPrice) <= 0) {
      errors.monthlyPrice = 'Price must be greater than 0';
    }
    if (!roomData.maxOccupancy) {
      errors.maxOccupancy = 'Max occupancy is required';
    }
    if (!roomData.floorNumber) {
      errors.floorNumber = 'Floor number is required';
    }
    if (!roomData.size) {
      errors.size = 'Room size is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // FIXED: Submit to backend with FormData to include images
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      
      // Append all room data fields
      formData.append('roomNumber', roomData.roomNumber);
      formData.append('monthlyPrice', roomData.monthlyPrice);
      formData.append('roomType', roomData.roomType);
      formData.append('maxOccupancy', roomData.maxOccupancy);
      formData.append('floorNumber', roomData.floorNumber);
      formData.append('size', roomData.size);
      formData.append('description', roomData.description || '');
      formData.append('availableFrom', roomData.availableFrom || '');
      formData.append('availableTo', roomData.availableTo || '');
      formData.append('status', roomData.status);
      
      // Append amenities as JSON string
      formData.append('amenities', JSON.stringify(roomData.amenities));
      
      // Append all image files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      let response;
      
      if (editingId) {
        // For update, we need to decide whether to replace or append images
        // By default, we'll append new images to existing ones
        formData.append('replaceImages', 'false'); // Change to 'true' if you want to replace all images
        response = await axios.put(`${API_BASE_URL}/update/${editingId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Room updated successfully!');
      } else {
        // Add new room with images
        response = await axios.post(`${API_BASE_URL}/add`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Room added successfully!');
      }

      console.log('Room saved successfully:', response.data);
      
      // Refresh rooms list
      await fetchRooms();
      
      // Reset form
      resetForm();
      setEditingId(null);
      
    } catch (err) {
      setError('Error saving room: ' + (err.response?.data?.message || err.message));
      console.error('Error saving room:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle edit - populate form with room data
  const handleEdit = async (room) => {
    setEditingId(room._id || room.id);
    
    // Format amenities for form
    const amenitiesObj = {
      privateBathroom: room.amenities?.privateBathroom || false,
      airConditioning: room.amenities?.airConditioning || false,
      highSpeedWifi: room.amenities?.highSpeedWifi || false,
      studyDesks: room.amenities?.studyDesks || 0,
      storageLockers: room.amenities?.storageLockers || false,
      miniFridge: room.amenities?.miniFridge || false,
      tv: room.amenities?.tv || false,
      balcony: room.amenities?.balcony || false,
      microwave: room.amenities?.microwave || false,
      washingMachine: room.amenities?.washingMachine || false,
      waterHeater: room.amenities?.waterHeater || false,
      parking: room.amenities?.parking || false
    };

    setRoomData({
      monthlyPrice: room.monthlyPrice || '',
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || 'single',
      maxOccupancy: room.maxOccupancy || '',
      floorNumber: room.floorNumber || '',
      size: room.size || '',
      description: room.description || '',
      availableFrom: room.availableFrom ? room.availableFrom.split('T')[0] : '',
      availableTo: room.availableTo ? room.availableTo.split('T')[0] : '',
      status: room.status || 'available',
      amenities: amenitiesObj
    });

    // Clear any previously uploaded images
    setImageFiles([]);
    imagePreview.forEach(preview => URL.revokeObjectURL(preview));
    setImagePreview([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/delete/${id}`);
        setSuccess('Room deleted successfully!');
        await fetchRooms();
      } catch (err) {
        setError('Error deleting room: ' + (err.response?.data?.message || err.message));
        console.error('Error deleting room:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setRoomData({
      monthlyPrice: '',
      roomNumber: '',
      roomType: 'single',
      maxOccupancy: '',
      floorNumber: '',
      size: '',
      description: '',
      availableFrom: '',
      availableTo: '',
      status: 'available',
      amenities: {
        privateBathroom: false,
        airConditioning: false,
        highSpeedWifi: false,
        studyDesks: 0,
        storageLockers: false,
        miniFridge: false,
        tv: false,
        balcony: false,
        microwave: false,
        washingMachine: false,
        waterHeater: false,
        parking: false
      }
    });
    
    // Clear image files and previews
    setImageFiles([]);
    imagePreview.forEach(preview => URL.revokeObjectURL(preview));
    setImagePreview([]);
    
    setValidationErrors({});
    setError('');
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const getStatusColor = (status) => {
    if (darkMode) {
      switch(status) {
        case 'available': return 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-500';
        case 'occupied': return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500';
        case 'maintenance': return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-yellow-500';
        case 'unavailable': return 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500';
        default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500';
      }
    } else {
      switch(status) {
        case 'available': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-green-100';
        case 'occupied': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-100';
        case 'maintenance': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-400 shadow-yellow-100';
        case 'unavailable': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-red-100';
        default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400';
      }
    }
  };

  const getRoomTypeIcon = (type) => {
    if (type === 'single') {
      return (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
  };

  // Donut chart component
  const DonutChart = ({ available, occupied, maintenance, unavailable }) => {
    const total = available + occupied + maintenance + unavailable;
    
    const availablePercent = total > 0 ? (available / total) * 100 : 0;
    const occupiedPercent = total > 0 ? (occupied / total) * 100 : 0;
    const maintenancePercent = total > 0 ? (maintenance / total) * 100 : 0;
    const unavailablePercent = total > 0 ? (unavailable / total) * 100 : 0;

    const circumference = 2 * Math.PI * 40;
    const availableOffset = circumference * (1 - (availablePercent / 100) * chartAnimation.donutProgress);
    const occupiedOffset = circumference * (1 - (occupiedPercent / 100) * chartAnimation.donutProgress);
    const maintenanceOffset = circumference * (1 - (maintenancePercent / 100) * chartAnimation.donutProgress);
    const unavailableOffset = circumference * (1 - (unavailablePercent / 100) * chartAnimation.donutProgress);

    return (
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={darkMode ? "#374151" : "#e5e7eb"}
            strokeWidth="10"
          />
          
          {availablePercent > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={`${circumference * (availablePercent / 100)} ${circumference}`}
              strokeDashoffset={availableOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
            />
          )}
          
          {occupiedPercent > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="10"
              strokeDasharray={`${circumference * (occupiedPercent / 100)} ${circumference}`}
              strokeDashoffset={occupiedOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
            />
          )}
          
          {maintenancePercent > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="10"
              strokeDasharray={`${circumference * (maintenancePercent / 100)} ${circumference}`}
              strokeDashoffset={maintenanceOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
            />
          )}
          
          {unavailablePercent > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#ef4444"
              strokeWidth="10"
              strokeDasharray={`${circumference * (unavailablePercent / 100)} ${circumference}`}
              strokeDashoffset={unavailableOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
            />
          )}
          
          <circle
            cx="50"
            cy="50"
            r="30"
            fill={darkMode ? "#1f2937" : "white"}
            className="shadow-inner"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{total}</span>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Rooms</span>
        </div>
      </div>
    );
  };

  // Bar chart component
  const BarChart = ({ available, occupied, maintenance, unavailable }) => {
    const total = available + occupied + maintenance + unavailable;
    const maxBarHeight = 120;

    return (
      <div className="flex items-end justify-around h-40 gap-2">
        <div className="flex flex-col items-center group">
          <div className={`relative w-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-t-lg overflow-hidden`} style={{ height: maxBarHeight }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all duration-1000 ease-out"
              style={{ height: `${(available / (total || 1)) * maxBarHeight * chartAnimation.barProgress}px` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-75"></div>
            </div>
          </div>
          <span className={`mt-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</span>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{available}</span>
        </div>

        <div className="flex flex-col items-center group">
          <div className={`relative w-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-t-lg overflow-hidden`} style={{ height: maxBarHeight }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-1000 ease-out"
              style={{ height: `${(occupied / (total || 1)) * maxBarHeight * chartAnimation.barProgress}px` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-blue-400 opacity-75"></div>
            </div>
          </div>
          <span className={`mt-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Occupied</span>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{occupied}</span>
        </div>

        <div className="flex flex-col items-center group">
          <div className={`relative w-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-t-lg overflow-hidden`} style={{ height: maxBarHeight }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-amber-500 rounded-t-lg transition-all duration-1000 ease-out"
              style={{ height: `${(maintenance / (total || 1)) * maxBarHeight * chartAnimation.barProgress}px` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-600 to-amber-400 opacity-75"></div>
            </div>
          </div>
          <span className={`mt-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Maintenance</span>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{maintenance}</span>
        </div>

        <div className="flex flex-col items-center group">
          <div className={`relative w-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-t-lg overflow-hidden`} style={{ height: maxBarHeight }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-t-lg transition-all duration-1000 ease-out"
              style={{ height: `${(unavailable / (total || 1)) * maxBarHeight * chartAnimation.barProgress}px` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-red-600 to-red-400 opacity-75"></div>
            </div>
          </div>
          <span className={`mt-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unavailable</span>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{unavailable}</span>
        </div>
      </div>
    );
  };

  // Trend line chart component
  const TrendLineChart = () => {
    const points = [
      { x: 0, y: 40 },
      { x: 20, y: 65 },
      { x: 40, y: 45 },
      { x: 60, y: 80 },
      { x: 80, y: 60 },
      { x: 100, y: 85 }
    ];

    const pathData = points.map((point, index) => {
      const x = (point.x / 100) * 280;
      const y = 80 - (point.y / 100) * 60;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <div className="relative h-24">
        <svg className="w-full h-full" viewBox="0 0 280 80" preserveAspectRatio="none">
          <line x1="0" y1="20" x2="280" y2="20" stroke={darkMode ? "#4b5563" : "#e5e7eb"} strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="40" x2="280" y2="40" stroke={darkMode ? "#4b5563" : "#e5e7eb"} strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="60" x2="280" y2="60" stroke={darkMode ? "#4b5563" : "#e5e7eb"} strokeWidth="1" strokeDasharray="4 4" />
          
          <path
            d={pathData}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-draw"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: 400 * (1 - chartAnimation.trendProgress)
            }}
          />
          
          {points.map((point, index) => {
            const x = (point.x / 100) * 280;
            const y = 80 - (point.y / 100) * 60;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={darkMode ? "#1f2937" : "white"}
                stroke="#8b5cf6"
                strokeWidth="2"
                className="transition-all duration-500"
                style={{ opacity: chartAnimation.trendProgress }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // Weekly occupancy component
  const WeeklyOccupancy = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const occupancyData = [65, 72, 68, 85, 92, 88, 78];

    return (
      <div className="flex items-end justify-between h-24 gap-1">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center flex-1">
            <div className={`relative w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-t-sm overflow-hidden`} style={{ height: '80px' }}>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-1000 ease-out"
                style={{ height: `${occupancyData[index] * 0.8 * chartAnimation.trendProgress}px` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-indigo-400 opacity-75"></div>
              </div>
            </div>
            <span className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day}</span>
          </div>
        ))}
      </div>
    );
  };

  // Room breakdown component
  const RoomBreakdown = () => {
    const floorData = [
      { floor: 'Floor 1', rooms: 12, occupied: 8 },
      { floor: 'Floor 2', rooms: 15, occupied: 12 },
      { floor: 'Floor 3', rooms: 15, occupied: 10 },
      { floor: 'Floor 4', rooms: 12, occupied: 9 },
      { floor: 'Floor 5', rooms: 10, occupied: 7 }
    ];

    return (
      <div className="space-y-3">
        {floorData.map((floor, index) => (
          <div key={floor.floor} className="flex items-center gap-3">
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-14`}>{floor.floor}</span>
            <div className={`flex-1 h-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(floor.occupied / floor.rooms) * 100 * chartAnimation.trendProgress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"></div>
              </div>
            </div>
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} w-16`}>{floor.occupied}/{floor.rooms}</span>
          </div>
        ))}
      </div>
    );
  };

  // Amenity icons mapping
  const amenityIcons = {
    privateBathroom: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12H9m6 0-3 3m3-3-3-3" />
      </svg>
    ),
    airConditioning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-2 2m2-2l-2-2" />
      </svg>
    ),
    highSpeedWifi: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
    studyDesks: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
    storageLockers: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12v4" />
      </svg>
    ),
    miniFridge: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 16h.01" />
      </svg>
    ),
    tv: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v4" />
      </svg>
    ),
    balcony: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12h18M3 12v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 12V6a2 2 0 012-2h14a2 2 0 012 2v6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12v6M16 12v6" />
      </svg>
    ),
    microwave: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
    washingMachine: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    waterHeater: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4" />
      </svg>
    ),
    parking: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 20h14M5 20V6a2 2 0 012-2h10a2 2 0 012 2v14M5 20H3m16 0h2M9 10h6" />
        <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
    }`}>
      {/* Header Section */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Room Details</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add and manage room information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Professional Dark/Light Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="relative group"
              >
                {/* Toggle Container */}
                <div className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-900 to-purple-900 shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/30'
                }`}>
                  {/* Icons Background */}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    {/* Sun Icon */}
                    <svg className={`w-4 h-4 transition-all duration-500 ${
                      darkMode ? 'text-white/30' : 'text-white'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    
                    {/* Moon Icon */}
                    <svg className={`w-4 h-4 transition-all duration-500 ${
                      darkMode ? 'text-white' : 'text-white/30'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  </div>

                  {/* Sliding Toggle Circle */}
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-all duration-500 ${
                    darkMode 
                      ? 'translate-x-9 bg-gradient-to-r from-indigo-400 to-purple-400' 
                      : 'translate-x-1 bg-gradient-to-r from-yellow-300 to-orange-300'
                  } flex items-center justify-center`}>
                    {/* Inner Icon */}
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

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <span className={`text-xs py-1 px-2 rounded ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-white'
                  }`}>
                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </span>
                </div>

                {/* Ripple Effect */}
                <span className="absolute inset-0 rounded-full animate-ping opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  style={{
                    backgroundColor: darkMode ? '#8b5cf6' : '#fbbf24',
                    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }}
                />
              </button>

              {/* Go to Dashboard Button */}
              <button
                onClick={handleGoToDashboard}
                className={`group flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
              >
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Period Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterType('year')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filterType === 'year'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setFilterType('month')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filterType === 'month'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilterType('week')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filterType === 'week'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Top Row - 4 Animated Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          {/* Available Rooms Card */}
          <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-emerald-500/20 rounded-bl-full"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Available</span>
              </div>
              <div className="space-y-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ready for occupancy</p>
                <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.available}</p>
                <p className={`text-xs flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                  {rooms.length > 0 ? Math.round((animatedStats.available / rooms.length) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>

          {/* Occupied Rooms Card */}
          <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-bl-full"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Occupied</span>
              </div>
              <div className="space-y-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Currently rented</p>
                <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.occupied}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Occupancy rate: {animatedStats.occupancyRate}%</p>
              </div>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-amber-500/20 rounded-bl-full"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Maintenance</span>
              </div>
              <div className="space-y-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Under repair</p>
                <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.maintenance}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Requires attention</p>
              </div>
            </div>
          </div>

          {/* Unavailable Card */}
          <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-bl-full"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">Unavailable</span>
              </div>
              <div className="space-y-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Not for rent</p>
                <p className={`text-4xl font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{animatedStats.unavailable}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Temporarily closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Donut Chart Card */}
          <div className={`lg:col-span-1 rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Room Distribution</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500'
              }`}>Total: {animatedStats.total}</span>
            </div>
            
            <div className="flex justify-center mb-4">
              <DonutChart 
                available={animatedStats.available}
                occupied={animatedStats.occupied}
                maintenance={animatedStats.maintenance}
                unavailable={animatedStats.unavailable}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available</span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} ml-auto`}>{animatedStats.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Occupied</span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} ml-auto`}>{animatedStats.occupied}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Maintenance</span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} ml-auto`}>{animatedStats.maintenance}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Unavailable</span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} ml-auto`}>{animatedStats.unavailable}</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className={`lg:col-span-2 rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Room Status Overview</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500'
              }`}>Occupancy Rate: {animatedStats.occupancyRate}%</span>
            </div>
            
            <BarChart 
              available={animatedStats.available}
              occupied={animatedStats.occupied}
              maintenance={animatedStats.maintenance}
              unavailable={animatedStats.unavailable}
            />
          </div>
        </div>

        {/* Bottom row with insight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Trend line chart card */}
          <div className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Weekly Trend</h3>
              <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <TrendLineChart />
            <div className={`flex items-center justify-between mt-3 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Weekly occupancy overview card */}
          <div className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Weekly Occupancy</h3>
              <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">This week</span>
            </div>
            <WeeklyOccupancy />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average 78%</span>
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>vs last week +5%</span>
            </div>
          </div>

          {/* Room breakdown summary card */}
          <div className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Floor Breakdown</h3>
              <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">By floor</span>
            </div>
            <RoomBreakdown />
          </div>
        </div>
      </div>

      {/* Progress Bar with Animation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Room Setup Progress</span>
          <span className="text-sm font-medium text-indigo-600">Step 2 of 4</span>
        </div>
        <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
          <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative">
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className={`rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Basic Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Monthly Price (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Rs.</span>
                    <input
                      type="number"
                      name="monthlyPrice"
                      value={roomData.monthlyPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="25000"
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                        validationErrors.monthlyPrice ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.monthlyPrice && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">{validationErrors.monthlyPrice}</p>
                  )}
                </div>

                <div className="group">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={roomData.roomNumber}
                    onChange={handleInputChange}
                    placeholder="A-101"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                      validationErrors.roomNumber ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.roomNumber && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">{validationErrors.roomNumber}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['single', 'shared'].map((type) => (
                      <label
                        key={type}
                        className={`flex-1 cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                          roomData.roomType === type
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : darkMode ? 'border-gray-700 hover:border-indigo-700' : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="roomType"
                          value={type}
                          checked={roomData.roomType === type}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className="px-4 py-3 flex items-center justify-center">
                          <svg
                            className={`w-5 h-5 mr-2 transition-all duration-200 ${
                              roomData.roomType === type 
                                ? 'text-indigo-600 dark:text-indigo-400' 
                                : darkMode ? 'text-gray-600' : 'text-gray-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {type === 'single' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            )}
                          </svg>
                          <span className={`font-medium capitalize ${roomData.roomType === type 
                            ? darkMode ? 'text-white' : 'text-gray-900'
                            : darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="group">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Occupancy <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="maxOccupancy"
                    value={roomData.maxOccupancy}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                      validationErrors.maxOccupancy ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="" className={darkMode ? 'bg-gray-700' : ''}>Select</option>
                    <option value="1" className={darkMode ? 'bg-gray-700' : ''}>1 Person</option>
                    <option value="2" className={darkMode ? 'bg-gray-700' : ''}>2 Persons</option>
                    <option value="3" className={darkMode ? 'bg-gray-700' : ''}>3 Persons</option>
                    <option value="4" className={darkMode ? 'bg-gray-700' : ''}>4 Persons</option>
                  </select>
                  {validationErrors.maxOccupancy && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">{validationErrors.maxOccupancy}</p>
                  )}
                </div>

                <div className="group">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Floor Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="floorNumber"
                    value={roomData.floorNumber}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="2"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                      validationErrors.floorNumber ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.floorNumber && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">{validationErrors.floorNumber}</p>
                  )}
                </div>

                <div className="group">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Size (sq ft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={roomData.size}
                    onChange={handleInputChange}
                    placeholder="220"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                      validationErrors.size ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.size && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">{validationErrors.size}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={roomData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Add detailed description about the room..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md ${
                      darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Images Card inside form - FIXED: Now using imageFiles state */}
              <div className="mt-6">
                <div className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group ${
                  darkMode 
                    ? 'border-gray-600 hover:border-indigo-500 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                      darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                    }`}>
                      <svg className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Click to upload images</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PNG, JPG, GIF up to 5MB each</p>
                    {imageFiles.length > 0 && (
                      <p className={`text-sm mt-2 font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {imageFiles.length} image(s) selected
                      </p>
                    )}
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group animate-fadeIn">
                        <img
                          src={preview}
                          alt={`Room ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 transform hover:scale-110"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {loading ? 'Saving...' : (editingId ? 'Update Room' : 'Add Room')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Sidebar (unchanged) */}
        <div className="space-y-6">
          {/* Availability Card */}
          <div className={`rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                Availability
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="group">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Available From
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={roomData.availableFrom}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>
              <div className="group">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Available To
                </label>
                <input
                  type="date"
                  name="availableTo"
                  value={roomData.availableTo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className={`rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Room Status
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { value: 'available', label: 'Available', color: 'green', icon: '✓', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                  { value: 'occupied', label: 'Occupied', color: 'blue', icon: '👤', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                  { value: 'maintenance', label: 'Maintenance', color: 'yellow', icon: '🔧', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
                  { value: 'unavailable', label: 'Unavailable', color: 'red', icon: '✗', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
                ].map((status, index) => (
                  <label
                    key={status.value}
                    className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-102 hover:shadow-md ${
                      roomData.status === status.value
                        ? darkMode 
                          ? `bg-${status.color}-900/30 border-${status.color}-700`
                          : `${status.bg} ${status.border}`
                        : darkMode
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-50'
                    } animate-slideInLeft`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={roomData.status === status.value}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <span className={`w-8 h-8 ${darkMode ? `bg-${status.color}-900/50` : status.bg} rounded-lg flex items-center justify-center mr-3`}>
                      <span className={darkMode ? `text-${status.color}-400` : status.text}>{status.icon}</span>
                    </span>
                    <span className={`font-medium ${
                      roomData.status === status.value 
                        ? darkMode ? `text-${status.color}-400` : status.text
                        : darkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {status.label}
                    </span>
                    {roomData.status === status.value && (
                      <svg className="w-5 h-5 ml-auto text-indigo-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities Card */}
          <div className={`rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </span>
                Amenities
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(roomData.amenities).map((key, index) => {
                  if (key === 'studyDesks') {
                    return (
                      <div key={key} className={`p-3 rounded-xl animate-fadeIn ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`} style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-center mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                            roomData.amenities.studyDesks > 0 
                              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' 
                              : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-white text-gray-400'
                          }`}>
                            {amenityIcons.studyDesks}
                          </div>
                          <span className={`flex-1 font-medium capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={`text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full`}>
                            {roomData.amenities.studyDesks}
                          </span>
                        </div>
                        <select
                          name="studyDesks"
                          value={roomData.amenities.studyDesks}
                          onChange={handleAmenityChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            darkMode ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          <option value="0" className={darkMode ? 'bg-gray-600' : ''}>None</option>
                          <option value="1" className={darkMode ? 'bg-gray-600' : ''}>1 Desk</option>
                          <option value="2" className={darkMode ? 'bg-gray-600' : ''}>2 Desks</option>
                          <option value="3" className={darkMode ? 'bg-gray-600' : ''}>3 Desks</option>
                          <option value="4" className={darkMode ? 'bg-gray-600' : ''}>4 Desks</option>
                        </select>
                      </div>
                    );
                  } else {
                    return (
                      <label key={key} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group transform hover:scale-102 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-50 hover:bg-indigo-50'
                      }`}>
                        <input
                          type="checkbox"
                          name={key}
                          checked={roomData.amenities[key]}
                          onChange={handleAmenityChange}
                          className="hidden"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                          roomData.amenities[key] 
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' 
                            : darkMode ? 'bg-gray-600 text-gray-400 group-hover:bg-gray-500' : 'bg-white text-gray-400 group-hover:bg-indigo-50'
                        }`}>
                          {amenityIcons[key]}
                        </div>
                        <span className={`flex-1 font-medium capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          roomData.amenities[key]
                            ? 'border-indigo-500 bg-indigo-500'
                            : darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          {roomData.amenities[key] && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    );
                  }
                })}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="px-6 py-4 bg-black/10">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                Quick Summary
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white/90">
                  <span>Price</span>
                  <span className="font-semibold text-white">
                    {roomData.monthlyPrice ? `Rs. ${roomData.monthlyPrice}` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Room Type</span>
                  <span className="font-semibold text-white capitalize">{roomData.roomType}</span>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Status</span>
                  <span className="font-semibold text-white capitalize">{roomData.status}</span>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Images</span>
                  <span className="font-semibold text-white">{imageFiles.length}</span>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Amenities</span>
                  <span className="font-semibold text-white">
                    {Object.values(roomData.amenities).filter(Boolean).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Table - From Backend */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8">
        <div className={`rounded-2xl shadow-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Room Details List
              </h2>
              
              {/* Export to Excel Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                </svg>
                Export to Excel
              </button>
            </div>
          </div>
          
          {/* Search and Filter Section */}
          <div className={`p-4 border-b ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex flex-wrap gap-4">
              {/* Search Bar */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search by room number, type, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'
                  }`}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'
                  }`}
                  placeholder="End Date"
                />
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <button
                    onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                    className={`px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className={`flex items-center px-4 py-2.5 rounded-lg border ${
                darkMode ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
              }`}>
                <span className="text-sm">
                  Showing <span className="font-semibold">{filteredRooms.length}</span> of <span className="font-semibold">{rooms.length}</span> rooms
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className={`border-b ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>#</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Room No</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Price (Rs.)</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Type</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Floor</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Size</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Max Occ</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-100'
              }`}>
                {filteredRooms.map((room, index) => (
                  <tr key={room._id || room.id} className={`group hover:bg-gradient-to-r transition-all duration-300 transform hover:scale-101 animate-fadeIn ${
                    darkMode 
                      ? 'hover:from-gray-700 hover:to-gray-600' 
                      : 'hover:from-indigo-50 hover:to-purple-50'
                  }`} style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-medium transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-400 group-hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-white'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{room.roomNumber}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Rs. {room.monthlyPrice}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getRoomTypeIcon(room.roomType)}
                        <span className="capitalize">{room.roomType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Floor {room.floorNumber}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{room.size} sq.ft</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{room.maxOccupancy} {room.maxOccupancy === 1 ? 'Person' : 'Persons'}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shadow-md ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center space-x-1">
                        {/* Edit Button */}
                        <div className="relative">
                          <button
                            onClick={() => handleEdit(room)}
                            onMouseEnter={() => setHoveredButton(`edit-${room._id || room.id}`)}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                            title="Edit Room"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Tooltip */}
                          {hoveredButton === `edit-${room._id || room.id}` && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 animate-fadeIn">
                              Edit Room
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <div className="relative">
                          <button
                            onClick={() => handleDelete(room._id || room.id)}
                            onMouseEnter={() => setHoveredButton(`delete-${room._id || room.id}`)}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                            title="Delete Room"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {/* Tooltip */}
                          {hoveredButton === `delete-${room._id || room.id}` && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 animate-fadeIn">
                              Delete Room
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

          {filteredRooms.length === 0 && !loading && (
            <div className="text-center py-12 animate-fadeIn">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <svg className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No rooms found</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideInRight z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideInRight z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">Saving room data...</p>
          </div>
        </div>
      )}

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes count {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes draw {
          from {
            stroke-dashoffset: 400;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-count {
          animation: count 0.5s ease-out;
        }

        .animate-draw {
          animation: draw 1.5s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .hover\\:scale-101:hover {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
};

export default RoomDetailsForm;