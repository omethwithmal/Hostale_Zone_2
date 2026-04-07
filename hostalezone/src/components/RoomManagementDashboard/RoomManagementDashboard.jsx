import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RoomManagementDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 156,
    availableRooms: 42,
    unavailableRooms: 114,
    maleRooms: 78,
    femaleRooms: 62,
    staffRooms: 16,
    transferRequests: 12,
    waitingList: 28
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    unavailableRooms: 0,
    maleRooms: 0,
    femaleRooms: 0,
    staffRooms: 0,
    transferRequests: 0,
    waitingList: 0
  });

  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  // Animate stats on load
  useEffect(() => {
    let start = 0;
    const maxValue = Math.max(...Object.values(stats));
    const timer = setInterval(() => {
      start += 1;
      setAnimatedStats({
        totalRooms: Math.min(start, stats.totalRooms),
        availableRooms: Math.min(start, stats.availableRooms),
        unavailableRooms: Math.min(start, stats.unavailableRooms),
        maleRooms: Math.min(start, stats.maleRooms),
        femaleRooms: Math.min(start, stats.femaleRooms),
        staffRooms: Math.min(start, stats.staffRooms),
        transferRequests: Math.min(start, stats.transferRequests),
        waitingList: Math.min(start, stats.waitingList)
      });
      
      if (start >= maxValue) {
        clearInterval(timer);
      }
    }, 10);

    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      title: 'Room Transfer Requests',
      count: stats.transferRequests,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      gradient: 'from-blue-600 to-cyan-500',
      lightGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
      link: '/room-transfer-request',
      description: '12 pending requests need attention',
      badge: 'urgent'
    },
    {
      title: 'Waiting List',
      count: stats.waitingList,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-600 to-orange-500',
      lightGradient: 'from-amber-50 to-orange-50',
      textColor: 'text-amber-600',
      link: '/waiting-list',
      description: '28 students waiting for rooms',
      badge: 'info'
    },
    {
      title: 'Assign Rooms',
      count: '24',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: 'from-emerald-600 to-teal-500',
      lightGradient: 'from-emerald-50 to-teal-50',
      textColor: 'text-emerald-600',
      link: '/assign-rooms',
      description: '24 rooms ready for allocation',
      badge: 'success'
    },
    {
      title: 'Room Details',
      count: stats.totalRooms,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-purple-600 to-pink-500',
      lightGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-600',
      link: '/room-details-form',
      description: 'Manage all room information',
      badge: 'info'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      student: 'Kasun Perera',
      regNo: '2022/CS/001',
      action: 'Requested room transfer',
      from: 'A-204',
      to: 'B-105',
      time: '2 minutes ago',
      status: 'pending',
      avatar: 'KP',
      priority: 'high'
    },
    {
      id: 2,
      student: 'Amali Silva',
      regNo: '2022/IT/045',
      action: 'Assigned to room',
      from: 'Waiting List',
      to: 'C-312',
      time: '15 minutes ago',
      status: 'approved',
      avatar: 'AS',
      priority: 'medium'
    },
    {
      id: 3,
      student: 'Nuwan Jayawardena',
      regNo: '2021/EN/112',
      action: 'Room maintenance',
      from: 'E-201',
      to: 'Maintenance',
      time: '1 hour ago',
      status: 'maintenance',
      avatar: 'NJ',
      priority: 'low'
    },
    {
      id: 4,
      student: 'Dilini Fernando',
      regNo: '2022/CS/089',
      action: 'Check-in completed',
      from: 'Waiting List',
      to: 'G-103',
      time: '3 hours ago',
      status: 'completed',
      avatar: 'DF',
      priority: 'medium'
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1 animate-pulse"></span>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
            Approved
          </span>
        );
      case 'maintenance':
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></span>
            Maintenance
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Glass Morphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-70"></div>
                <div className="relative p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Room Management
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  System is active · 156 total rooms
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/20 shadow-sm">
                {['day', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedTimeRange === range
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              {/* Profile Button */}
              <button className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold">AD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner with 3D Effect */}
        <div className="relative mb-8 group perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative transform-gpu transition-all duration-500 group-hover:rotate-x-2 group-hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-20 -mb-20 animate-pulse-slow"></div>
              
              <div className="relative px-8 py-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="text-white mb-6 lg:mb-0">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h2>
                    <p className="text-indigo-100 text-lg max-w-2xl">
                      You have 12 pending transfer requests and 28 students in waiting list. 
                      Here's what's happening with your hostel today.
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-6">
                      <Link
                        to="/room-details-form"
                        className="group relative px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-semibold flex items-center shadow-xl overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        <span className="relative flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add New Room
                        </span>
                      </Link>
                      
                      <Link
                        to="/room-transfer-request"
                        className="group relative px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-all duration-300 font-semibold flex items-center shadow-xl overflow-hidden backdrop-blur-sm border border-white/20"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        <span className="relative flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          View Transfer Requests
                          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">12</span>
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* 3D Stats Card */}
                  <div className="relative transform-gpu transition-all duration-500 hover:rotate-y-12 hover:scale-105">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <div className="text-white text-center">
                        <p className="text-sm text-indigo-200 mb-1">Total Rooms</p>
                        <p className="text-5xl font-bold mb-2">{stats.totalRooms}</p>
                        <div className="flex items-center justify-center text-emerald-300 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>+12% from last month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid with 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Rooms',
              value: animatedStats.totalRooms,
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              gradient: 'from-indigo-600 to-purple-600',
              lightGradient: 'from-indigo-50 to-purple-50',
              textColor: 'text-indigo-600',
              change: '+12%',
              changeColor: 'text-emerald-600'
            },
            {
              title: 'Available Rooms',
              value: animatedStats.availableRooms,
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                </svg>
              ),
              gradient: 'from-emerald-600 to-teal-500',
              lightGradient: 'from-emerald-50 to-teal-50',
              textColor: 'text-emerald-600',
              change: '+5%',
              changeColor: 'text-emerald-600'
            },
            {
              title: 'Unavailable',
              value: animatedStats.unavailableRooms,
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ),
              gradient: 'from-rose-600 to-pink-500',
              lightGradient: 'from-rose-50 to-pink-50',
              textColor: 'text-rose-600',
              change: '-3%',
              changeColor: 'text-rose-600'
            },
            {
              title: 'Transfer Requests',
              value: animatedStats.transferRequests,
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              ),
              gradient: 'from-blue-600 to-cyan-500',
              lightGradient: 'from-blue-50 to-cyan-50',
              textColor: 'text-blue-600',
              change: '+8',
              changeColor: 'text-amber-600'
            }
          ].map((card, index) => (
            <div
              key={index}
              className="group relative perspective-1000"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity`}></div>
              <div className={`relative transform-gpu transition-all duration-500 ${
                hoveredCard === index ? 'rotate-x-6 scale-105' : ''
              }`}>
                <div className={`bg-gradient-to-br ${card.lightGradient} rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${card.gradient} rounded-xl shadow-lg flex items-center justify-center text-white transform-gpu transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                      {card.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 tabular-nums">{card.value}</p>
                      <p className={`text-sm ${card.changeColor} flex items-center`}>
                        {card.change.includes('+') ? (
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        )}
                        {card.change}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-600">Last updated {selectedTimeRange} ago</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Occupancy Rate</span>
                      <span>{Math.floor((card.value / stats.totalRooms) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000`}
                        style={{ width: `${(card.value / stats.totalRooms) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Block Statistics with 3D Flip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              block: 'Block A',
              type: 'Male Hostel',
              count: animatedStats.maleRooms,
              available: Math.floor(animatedStats.maleRooms * 0.3),
              occupied: Math.floor(animatedStats.maleRooms * 0.7),
              gradient: 'from-blue-600 to-cyan-500',
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )
            },
            {
              block: 'Block B',
              type: 'Female Hostel',
              count: animatedStats.femaleRooms,
              available: Math.floor(animatedStats.femaleRooms * 0.25),
              occupied: Math.floor(animatedStats.femaleRooms * 0.75),
              gradient: 'from-pink-600 to-rose-500',
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )
            },
            {
              block: 'Block C',
              type: 'Staff Quarters',
              count: animatedStats.staffRooms,
              available: Math.floor(animatedStats.staffRooms * 0.1),
              occupied: Math.floor(animatedStats.staffRooms * 0.9),
              gradient: 'from-amber-600 to-orange-500',
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )
            }
          ].map((block, index) => (
            <div key={index} className="group perspective-1000 h-64">
              <div className="relative w-full h-full transition-all duration-700 transform-gpu group-hover:rotate-y-180" style={{ transformStyle: 'preserve-3d' }}>
                {/* Front of card */}
                <div className="absolute inset-0 backface-hidden">
                  <div className={`h-full bg-gradient-to-br ${block.gradient} rounded-2xl p-6 shadow-2xl text-white overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                          {block.icon}
                        </div>
                        <span className="text-5xl font-bold">{block.count}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-1">{block.block}</h3>
                      <p className="text-white/80 mb-4">{block.type}</p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Available: {block.available}</span>
                          <span>Occupied: {block.occupied}</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-1000"
                            style={{ width: `${(block.occupied / block.count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Back of card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                  <div className="h-full bg-white rounded-2xl p-6 shadow-2xl border-2 border-indigo-100">
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${block.gradient} rounded-xl flex items-center justify-center text-white mb-4`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h4>
                      <p className="text-sm text-gray-600 mb-4">Manage {block.block} rooms</p>
                      <Link
                        to="/room-details-form"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid with Floating Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group relative"
              onMouseEnter={() => setHoveredCard(`action-${index}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity`}></div>
              <div className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 transform-gpu transition-all duration-500 ${
                hoveredCard === `action-${index}` ? 'translate-y-[-8px] shadow-2xl' : ''
              }`}>
                {/* Floating badge for urgent items */}
                {action.badge === 'urgent' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-md"></div>
                      <span className="relative px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
                        URGENT
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-xl shadow-lg flex items-center justify-center text-white transform-gpu transition-all group-hover:scale-110 group-hover:rotate-12`}>
                    {action.icon}
                  </div>
                  <span className="text-3xl font-bold text-gray-900 tabular-nums">{action.count}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                
                <div className={`flex items-center text-sm font-medium ${action.textColor} group-hover:translate-x-2 transition-transform duration-300`}>
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Activity
                  </h3>
                  <Link to="/all-activities" className="text-white/80 hover:text-white text-sm flex items-center">
                    View All
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="relative group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                    {/* Timeline line */}
                    {index < recentActivities.length - 1 && (
                      <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
                    )}
                    
                    <div className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
                            activity.status === 'pending' ? 'from-amber-500 to-orange-500' :
                            activity.status === 'approved' ? 'from-emerald-500 to-teal-500' :
                            activity.status === 'maintenance' ? 'from-blue-500 to-cyan-500' :
                            'from-purple-500 to-pink-500'
                          } flex items-center justify-center text-white font-semibold shadow-lg`}>
                            {activity.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            activity.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                            activity.status === 'approved' ? 'bg-emerald-500' :
                            activity.status === 'maintenance' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{activity.student}</h4>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{activity.action}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-indigo-600 font-medium">{activity.from}</span>
                            <span className="mx-1 text-gray-400">→</span>
                            <span className="text-purple-600 font-medium">{activity.to}</span>
                          </p>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(activity.status)}
                            <span className="text-xs text-gray-400">{activity.regNo}</span>
                            {activity.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">High Priority</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links and Stats */}
          <div className="space-y-6">
            {/* Quick Links Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Links
                </h3>
              </div>
              
              <div className="p-4 space-y-2">
                {[
                  { to: '/room-details-form', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add New Room', desc: 'Create new room details', color: 'from-indigo-600 to-purple-600' },
                  { to: '/room-transfer-request', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', label: 'Transfer Requests', desc: 'Manage room change requests', color: 'from-blue-600 to-cyan-500' },
                  { to: '/waiting-list', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Waiting List', desc: `${stats.waitingList} students waiting`, color: 'from-amber-600 to-orange-500' },
                  { to: '/assign-rooms', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Assign Rooms', desc: 'Allocate rooms to students', color: 'from-emerald-600 to-teal-500' }
                ].map((link, index) => (
                  <Link
                    key={index}
                    to={link.to}
                    className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${link.color} rounded-lg flex items-center justify-center mr-3 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-indigo-600">{link.label}</p>
                      <p className="text-xs text-gray-500">{link.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Room Status Overview */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Room Status
                </h3>
              </div>
              
              <div className="p-4 space-y-3">
                {[
                  { label: 'Available', count: stats.availableRooms, color: 'emerald', percentage: (stats.availableRooms / stats.totalRooms) * 100 },
                  { label: 'Occupied', count: Math.floor(stats.totalRooms * 0.6), color: 'blue', percentage: 60 },
                  { label: 'Maintenance', count: Math.floor(stats.totalRooms * 0.1), color: 'amber', percentage: 10 },
                  { label: 'Reserved', count: Math.floor(stats.totalRooms * 0.05), color: 'purple', percentage: 5 }
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200">System Health</p>
                    <p className="text-2xl font-bold">98.5%</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-xs">
                  Active
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-indigo-200">Response Time</p>
                  <p className="font-semibold">124ms</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-indigo-200">Uptime</p>
                  <p className="font-semibold">99.9%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-x-2 {
          transform: rotateX(2deg);
        }
        
        .rotate-x-6 {
          transform: rotateX(6deg);
        }
        
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .transform-gpu {
          transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  );
};

export default RoomManagementDashboard;