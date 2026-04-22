import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const R_AdminDashboard = () => {
  const navigate = useNavigate();

  // Store logged-in admin data
  const [adminUser, setAdminUser] = useState(null);

  // Read admin data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userStr) {
      navigate("/SignIn");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);

      // Only allow admin users here
      if (
        parsedUser.userType !== "admin" &&
        parsedUser.role !== "admin"
      ) {
        navigate("/SignIn");
        return;
      }

      setAdminUser(parsedUser);
    } catch (error) {
      console.error("Failed to parse user:", error);
      navigate("/SignIn");
    }
  }, [navigate]);

  // Logged-in admin email
  const adminEmail = useMemo(() => {
    return adminUser?.email?.toLowerCase?.() || "";
  }, [adminUser]);

  // Admin module cards
  const moduleCards = [
    {
      id: "leave",
      title: "Leave Management",
      description: "Manage student leave requests and approval process.",
      route: "/R-AdminLeaveManagement",
      allowedEmails: ["ranga@gmail.com"],
      icon: "bi-calendar-check",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      id: "room",
      title: "Room Management",
      description: "Manage room allocation, room updates, and room requests.",
      route: "/RoomManagementDashboard",
      allowedEmails: ["ometh@gmail.com"],
      icon: "bi-building",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      id: "complaint",
      title: "Complaint Management",
      description: "View complaints, update status, and manage complaint records.",
      route: "/complaint-admin",
      allowedEmails: ["hansika@gmail.com"],
      icon: "bi-exclamation-triangle",
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      id: "payment",
      title: "Payment Management",
      description: "Manage payment details and related payment records.",
      route: "/payments",
      allowedEmails: ["angalee@gmail.com"],
      icon: "bi-credit-card",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  // Check whether current admin can access a module
  const canAccessModule = (allowedEmails) => {
    if (!adminEmail) return false;
    return allowedEmails.map((email) => email.toLowerCase()).includes(adminEmail);
  };

  // Open correct module if assigned
  const handleModuleClick = (module) => {
    if (canAccessModule(module.allowedEmails)) {
      navigate(module.route);
    } else {
      alert("This module is assigned to another admin user.");
    }
  };

  // Logout admin
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/SignIn");
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-blue-100 text-sm uppercase tracking-[0.2em] font-semibold mb-2">
                  Admin Control Panel
                </p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  R Admin Dashboard
                </h1>
                <p className="text-blue-100 mt-2">
                  Welcome back, {adminUser.fullName} ({adminUser.email})
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-all flex items-center gap-2 backdrop-blur-sm"
                  type="button"
                >
                  <i className="bi bi-house-door"></i>
                  <span>Main Home</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-500/90 hover:bg-red-600 px-5 py-3 rounded-xl transition-all flex items-center gap-2"
                  type="button"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <i className="bi bi-person-badge text-blue-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admin Name</p>
                  <p className="font-bold text-gray-800">{adminUser.fullName}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <i className="bi bi-envelope text-indigo-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admin Email</p>
                  <p className="font-bold text-gray-800 break-all">{adminUser.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <i className="bi bi-shield-check text-violet-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Access Type</p>
                  <p className="font-bold text-gray-800">Admin User</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modules heading */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Admin Management Modules</h2>
            <p className="text-slate-500 mt-1">
              Click your assigned management section below.
            </p>
          </div>

          {/* Module buttons/cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moduleCards.map((module) => {
              const hasAccess = canAccessModule(module.allowedEmails);

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-3xl shadow-md border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className={`bg-gradient-to-r ${module.gradient} p-6 text-white`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                          <i className={`${module.icon} text-2xl`}></i>
                        </div>
                        <h3 className="text-2xl font-bold">{module.title}</h3>
                        <p className="text-white/85 mt-2 text-sm leading-6">
                          {module.description}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                          hasAccess
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-black/20 border-white/20 text-white"
                        }`}
                      >
                        {hasAccess ? "Assigned to You" : "Not Assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-sm text-slate-500">Route</p>
                        <p className="font-semibold text-slate-800">{module.route}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500">Assigned Admin</p>
                        <p className="font-semibold text-slate-800">
                          {module.allowedEmails.join(", ")}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleModuleClick(module)}
                      className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                        hasAccess
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                      type="button"
                    >
                      {hasAccess ? `Open ${module.title}` : "Assigned to Another Admin"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default R_AdminDashboard;