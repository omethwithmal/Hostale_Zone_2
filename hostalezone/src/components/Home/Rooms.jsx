// RoomsPage.jsx
import React, { useState, useEffect } from 'react';

const RoomsPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    specialRequests: ''
  });

  const roomTypes = ['All', 'Single', 'Shared'];

  // Base URL for your backend
  const BASE_URL = 'http://localhost:8070';

  // Default placeholder images for different room types
  const DEFAULT_IMAGES = {
    single: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    shared: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  };

  // Fetch rooms from backend
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/roomdetails/display`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log('Fetched rooms:', data); // Debug log
      
      // Transform backend data to match frontend structure
      const transformedRooms = data.map(room => ({
        id: room._id,
        roomId: room.roomId,
        roomNumber: room.roomNumber || room.roomId,
        type: room.roomType === 'single' ? 'Single Room' : 'Shared Room',
        roomType: room.roomType,
        monthlyPrice: room.monthlyPrice || 0,
        maximumOccupancy: room.maxOccupancy ? `${room.maxOccupancy} person${room.maxOccupancy > 1 ? 's' : ''}` : '1 person',
        maxOccupancy: room.maxOccupancy,
        floorNumber: room.floorNumber ? `${room.floorNumber}${getFloorSuffix(room.floorNumber)} Floor` : 'Ground Floor',
        floor: room.floorNumber,
        size: room.size ? `${room.size} sq ft` : '120 sq ft',
        sizeValue: room.size,
        description: room.description || 'Comfortable room with modern amenities.',
        // Use imageUrls from backend if available, otherwise process images
        images: processRoomImages(room),
        availability: room.status === 'available',
        availableFromDate: room.availableFrom ? new Date(room.availableFrom).toISOString().split('T')[0] : '2024-03-01',
        availableToDate: room.availableTo ? new Date(room.availableTo).toISOString().split('T')[0] : '2024-12-31',
        roomStatus: room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Available',
        status: room.status,
        amenities: transformAmenities(room.amenities || {}),
        rating: 4.5,
        reviews: Math.floor(Math.random() * 50) + 10
      }));
      
      setRooms(transformedRooms);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process room images - use imageUrls from backend if available
  const processRoomImages = (room) => {
    const roomType = room.roomType === 'single' ? 'single' : 'shared';
    const defaultImages = DEFAULT_IMAGES[roomType];
    
    // If backend provides imageUrls, use them
    if (room.imageUrls && room.imageUrls.length > 0) {
      // Ensure we have at least 3 images
      const images = [...room.imageUrls];
      while (images.length < 3) {
        images.push(defaultImages[images.length % defaultImages.length]);
      }
      return images;
    }
    
    // If no imageUrls but images array exists, construct URLs
    if (room.images && room.images.length > 0) {
      const processedImages = room.images.map(image => {
        // If it's already a full URL
        if (typeof image === 'string' && image.startsWith('http')) {
          return image;
        }
        // Construct full URL from relative path
        if (typeof image === 'string') {
          // Remove any leading './' or '../'
          const cleanPath = image.replace(/^\.\/|\.\.\//g, '');
          return `${BASE_URL}/${cleanPath}`;
        }
        return defaultImages[0];
      });
      
      // Ensure we have at least 3 images
      while (processedImages.length < 3) {
        processedImages.push(defaultImages[processedImages.length % defaultImages.length]);
      }
      return processedImages;
    }
    
    // Return default images if no images found
    return defaultImages;
  };

  // Helper function to get floor suffix
  const getFloorSuffix = (floor) => {
    if (floor === 1) return 'st';
    if (floor === 2) return 'nd';
    if (floor === 3) return 'rd';
    return 'th';
  };

  // Helper function to transform amenities
  const transformAmenities = (amenities) => {
    const amenityList = [];
    
    if (amenities.privateBathroom) {
      amenityList.push({ name: 'Private Bathroom', included: true, icon: '🚿' });
    }
    if (amenities.airConditioning) {
      amenityList.push({ name: 'Air Conditioning', included: true, icon: '❄️' });
    }
    if (amenities.highSpeedWifi) {
      amenityList.push({ name: 'High-Speed WiFi', included: true, icon: '📶' });
    }
    if (amenities.studyDesks && amenities.studyDesks > 0) {
      amenityList.push({ name: 'Study Desks', included: true, count: amenities.studyDesks, icon: '📚' });
    }
    if (amenities.storageLockers) {
      amenityList.push({ name: 'Storage Lockers', included: true, count: 1, icon: '🔒' });
    }
    if (amenities.miniFridge) {
      amenityList.push({ name: 'Mini Fridge', included: true, icon: '🧊' });
    }
    if (amenities.tv) {
      amenityList.push({ name: 'TV', included: true, icon: '📺' });
    }
    if (amenities.balcony) {
      amenityList.push({ name: 'Balcony', included: true, icon: '🏞️' });
    }
    if (amenities.microwave) {
      amenityList.push({ name: 'Microwave', included: true, icon: '🔥' });
    }
    if (amenities.washingMachine) {
      amenityList.push({ name: 'Washing Machine', included: true, icon: '🧺' });
    }
    if (amenities.waterHeater) {
      amenityList.push({ name: 'Water Heater', included: true, icon: '💧' });
    }
    if (amenities.parking) {
      amenityList.push({ name: 'Parking', included: true, icon: '🅿️' });
    }

    // If no amenities, add default ones
    if (amenityList.length === 0) {
      amenityList.push(
        { name: 'Basic Furniture', included: true, icon: '🪑' },
        { name: 'Study Desk', included: true, count: 1, icon: '📚' },
        { name: 'Storage', included: true, icon: '📦' }
      );
    }

    return amenityList;
  };

  // Filter rooms based on search and type
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || 
                       (selectedType === 'Single' && room.type === 'Single Room') ||
                       (selectedType === 'Shared' && room.type === 'Shared Room');
    return matchesSearch && matchesType;
  });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would typically send the booking data to your backend
      const bookingData = {
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        ...bookingForm
      };
      
      console.log('Booking submitted:', bookingData);
      alert('Booking request submitted successfully! We will contact you shortly.');
      
      setSelectedRoom(null);
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        specialRequests: ''
      });
    } catch (error) {
      alert('Error submitting booking. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const RoomTypeIcon = ({ type }) => {
    const icons = {
      'Single Room': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Shared Room': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    };
    return icons[type] || icons['Single Room'];
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Function to handle image error - if image fails to load, show appropriate placeholder
  const handleImageError = (e, roomType = 'single') => {
    const defaultImage = roomType === 'single' 
      ? DEFAULT_IMAGES.single[0] 
      : DEFAULT_IMAGES.shared[0];
    e.target.src = defaultImage;
    e.target.onerror = null; // Prevent infinite loop
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Rooms</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRooms}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Find Your Perfect Room</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Discover comfortable and affordable accommodation designed for students
          </p>
        </div>
      </section>
      
      {/* Creative Filter Section - Blue Theme */}
      <section className="py-8 -mt-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Main Filter Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Search Input - Blue Theme */}
                <div className="relative group">
                  <label className="block text-gray-700 mb-3 font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Your Room
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type room number or type..."
                      className="w-full px-5 py-3.5 pl-12 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 group-hover:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Room Type Filter - Blue Theme */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Room Type
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 appearance-none bg-white cursor-pointer"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Results Display - Blue Theme */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Options
                  </label>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-700 mb-1">{filteredRooms.length}</div>
                      <div className="text-blue-600 font-medium">Perfect Rooms Found</div>
                      <div className="text-xs text-blue-500 mt-1">
                        {filteredRooms.filter(r => r.availability).length} available now
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Quick Filter Chips - Blue Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-600 text-sm font-medium">Quick filters:</span>
                  {roomTypes.slice(1).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                        selectedType === type 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedType('All')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedType === 'All' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow'
                    }`}
                  >
                    Show All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Grid Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Explore Our <span className="text-blue-600">Rooms</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each room is designed with student life in mind, combining comfort, functionality, and style
            </p>
          </div>

          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <div 
                  key={room.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => setSelectedRoom(room)}
                >
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      room.availability 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-red-500 text-white shadow-lg'
                    }`}>
                      {room.availability ? 'AVAILABLE' : 'NOT AVAILABLE'}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                      <span className="font-bold text-gray-900">#{room.roomNumber}</span>
                    </div>
                  </div>

                  {/* Room Image with Overlay - Using processed images */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={room.images[0]} 
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => handleImageError(e, room.roomType)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Floor Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-800">
                        {room.floorNumber}
                      </div>
                    </div>
                  </div>

                  {/* Room Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <RoomTypeIcon type={room.type} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{room.type}</h3>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(room.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {room.rating} ({room.reviews})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          Rs. {room.monthlyPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>

                    {/* Room Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{room.maximumOccupancy}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                        <span>{room.size}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                        {room.roomStatus}
                      </span>
                    </div>

                    {/* Amenities Preview */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                            {amenity.icon} {amenity.name} {amenity.count ? `(${amenity.count})` : ''}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group">
                      <span className="flex items-center justify-center">
                        View Details
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No rooms match your search</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Creative Popup Modal - Blue Theme */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with Blur */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedRoom(null)}
          />
          
          {/* Modal Container */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl transform transition-all">
              
              {/* Close Button - Blue Theme */}
              <button 
                onClick={() => setSelectedRoom(null)}
                className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Room Images & Details */}
                <div className="lg:w-2/3 p-8">
                  {/* Room Header */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <RoomTypeIcon type={selectedRoom.type} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Room {selectedRoom.roomNumber}</h2>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-gray-600">{selectedRoom.type}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{selectedRoom.floorNumber}</span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i}
                                className={`w-5 h-5 ${i < Math.floor(selectedRoom.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-gray-600">{selectedRoom.rating} ({selectedRoom.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold ${
                        selectedRoom.availability 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${selectedRoom.availability ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                        {selectedRoom.availability ? 'Available for Booking' : 'Currently Unavailable'}
                      </div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold border ${getStatusColor(selectedRoom.status)}`}>
                        Status: {selectedRoom.roomStatus}
                      </div>
                    </div>

                    {/* Availability Dates */}
                    <div className="bg-blue-50 p-4 rounded-xl mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-blue-600 mb-1">Available From</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(selectedRoom.availableFromDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-blue-600 mb-1">Available To</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(selectedRoom.availableToDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery - Using processed images */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Room Gallery</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main large image - first image */}
                      <div className="col-span-2">
                        <div className="relative h-64 rounded-2xl overflow-hidden">
                          <img 
                            src={selectedRoom.images[0]} 
                            alt="Main room view"
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, selectedRoom.roomType)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                      </div>
                      {/* Additional images - show up to 2 more */}
                      {selectedRoom.images.slice(1, 3).map((img, index) => (
                        <div key={index} className="relative h-40 rounded-xl overflow-hidden group">
                          <img 
                            src={img} 
                            alt={`Room view ${index + 2}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => handleImageError(e, selectedRoom.roomType)}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedRoom.description}</p>
                  </div>

                  {/* Room Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">Room Number</div>
                      <div className="text-lg font-bold text-gray-900">{selectedRoom.roomNumber}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">Floor</div>
                      <div className="text-lg font-bold text-gray-900">{selectedRoom.floorNumber}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">Size</div>
                      <div className="text-lg font-bold text-gray-900">{selectedRoom.size}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">Max Occupancy</div>
                      <div className="text-lg font-bold text-gray-900">{selectedRoom.maximumOccupancy}</div>
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRoom.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                              <span className="text-sm">{amenity.icon}</span>
                            </div>
                            <span className="text-gray-700 font-medium">{amenity.name}</span>
                          </div>
                          {amenity.count && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                              {amenity.count} {amenity.count > 1 ? 'units' : 'unit'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side - Booking Form */}
                <div className="lg:w-1/3 bg-gray-50 p-8 border-l border-gray-200">
                  <div className="sticky top-8">
                    {/* Price Display - Blue Theme */}
                    <div className="mb-8 text-center">
                      <div className="text-5xl font-bold text-blue-600 mb-2">
                        Rs. {selectedRoom.monthlyPrice.toLocaleString()}
                      </div>
                      <div className="text-gray-600">per month</div>
                      <div className="text-sm text-gray-500 mt-2">+ One-time security deposit: Rs. 40,000</div>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-3">Quick Info</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Room Type:</span>
                          <span className="font-medium text-gray-900">{selectedRoom.type}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Room Number:</span>
                          <span className="font-medium text-gray-900">{selectedRoom.roomNumber}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Floor:</span>
                          <span className="font-medium text-gray-900">{selectedRoom.floorNumber}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Maximum Occupancy:</span>
                          <span className="font-medium text-gray-900">{selectedRoom.maximumOccupancy}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium text-gray-900">{selectedRoom.size}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Booking Form */}
                    {selectedRoom.availability && selectedRoom.status === 'available' ? (
                      <form onSubmit={handleBookingSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Information
                          </label>
                          <div className="space-y-4">
                            <input
                              type="text"
                              name="name"
                              required
                              placeholder="Full Name"
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                              value={bookingForm.name}
                              onChange={handleInputChange}
                            />
                            <input
                              type="email"
                              name="email"
                              required
                              placeholder="Email Address"
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                              value={bookingForm.email}
                              onChange={handleInputChange}
                            />
                            <input
                              type="tel"
                              name="phone"
                              required
                              placeholder="Phone Number"
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                              value={bookingForm.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Stay Dates
                          </label>
                          <div className="space-y-4">
                            <input
                              type="date"
                              name="checkIn"
                              required
                              min={selectedRoom.availableFromDate}
                              max={selectedRoom.availableToDate}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                              value={bookingForm.checkIn}
                              onChange={handleInputChange}
                            />
                            <input
                              type="date"
                              name="checkOut"
                              required
                              min={selectedRoom.availableFromDate}
                              max={selectedRoom.availableToDate}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                              value={bookingForm.checkOut}
                              onChange={handleInputChange}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Available: {new Date(selectedRoom.availableFromDate).toLocaleDateString()} - {new Date(selectedRoom.availableToDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Special Requests
                          </label>
                          <textarea
                            name="specialRequests"
                            rows="3"
                            placeholder="Any special requirements or questions..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition resize-none"
                            value={bookingForm.specialRequests}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group"
                        >
                          <span className="flex items-center justify-center">
                            Book Now
                            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Currently Unavailable</h4>
                        <p className="text-gray-600 mb-4">
                          This room is {selectedRoom.roomStatus.toLowerCase()}. 
                          {selectedRoom.availableFromDate && (
                            <> Available from {new Date(selectedRoom.availableFromDate).toLocaleDateString()}.</>
                          )}
                        </p>
                        <button
                          onClick={() => setSelectedRoom(null)}
                          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300"
                        >
                          View Other Rooms
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;