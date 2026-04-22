import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  XMarkIcon,
  Bars3Icon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  // Router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // Navbar states
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);

  // Theme colors
  const colors = {
    secondary: "#1E40AF",
    accent: "#3B82F6",
    text: "#1F2937",
    textLight: "#FFFFFF",
    border: "#E5E7EB",
  };

  // Complaint module navigation items
  const navItems = [
    {
      name: "Home",
      path: "/complaint-home",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: "Dashboard",
      path: "/complaint-dashboard",
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
    },
    {
      name: "Complaints",
      path: "/complaints",
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
    },
    {
      name: "Raise Complaint",
      path: "/new-complaint",
      icon: <PlusCircleIcon className="w-5 h-5" />,
    },
  ];

  // Detect active page
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = navItems.find((item) => item.path === currentPath);

    if (currentItem) {
      setActiveItem(currentItem.name);
    } else {
      setActiveItem("Home");
    }
  }, [location.pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Common navigation handler
  const handleNavClick = (name, path) => {
    setActiveItem(name);
    setOpen(false);
    navigate(path);
  };

  // Go back to main home page
  const handleBackToMainHome = () => {
    setOpen(false);
    navigate("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-xl backdrop-blur-lg bg-white/95" : "shadow-md bg-white"
      }`}
      style={{ borderBottom: `2px solid ${colors.border}` }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo section */}
          <div className="flex items-center">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavClick("Home", "/complaint-home")}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white border-4 border-white">
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <ShieldCheckIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span
                  className="text-xl lg:text-2xl font-bold tracking-tight"
                  style={{ color: colors.secondary }}
                >
                  HOSTAL
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    ZONE
                  </span>
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  Complaint &amp; Maintenance Suite
                </span>
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => handleNavClick(item.name, item.path)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative ${
                      activeItem === item.name ? "transform scale-105" : "hover:scale-105"
                    }`}
                    style={{
                      color: activeItem === item.name ? colors.secondary : colors.text,
                      backgroundColor:
                        activeItem === item.name
                          ? "rgba(59, 130, 246, 0.1)"
                          : "transparent",
                    }}
                  >
                    {item.icon}
                    <span className="font-semibold">{item.name}</span>

                    {activeItem === item.name && (
                      <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 rounded-t-full"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Main home button with matching navbar style */}
            <div className="relative">
              <button
                onClick={handleBackToMainHome}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative hover:scale-105"
                style={{
                  color: colors.text,
                  backgroundColor: "transparent",
                }}
                type="button"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-semibold">Main Home</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setOpen(!open)}
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                open ? "bg-blue-50" : ""
              }`}
              style={{ color: colors.secondary }}
              aria-label="Toggle navigation"
              type="button"
            >
              <div className="relative w-6 h-6">
                {open ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6 animate-pulse" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 z-40 transform transition-all duration-300 ease-in-out ${
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="mx-4 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            border: `2px solid ${colors.border}`,
          }}
        >
          <div className="flex flex-col p-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name, item.path)}
                className={`flex items-center justify-between space-x-3 px-4 py-4 my-1 rounded-xl transition-all duration-300 ${
                  activeItem === item.name ? "bg-blue-50 transform scale-[1.02]" : ""
                }`}
                style={{
                  borderLeft:
                    activeItem === item.name
                      ? `4px solid ${colors.accent}`
                      : "4px solid transparent",
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activeItem === item.name ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {React.cloneElement(item.icon, {
                      className: "w-5 h-5",
                      style: {
                        color:
                          activeItem === item.name ? colors.accent : colors.text,
                      },
                    })}
                  </div>
                  <span
                    className={`font-semibold ${
                      activeItem === item.name ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Mobile back button */}
            <button
              onClick={handleBackToMainHome}
              className="mt-3 w-full flex items-center justify-center space-x-3 px-4 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50"
              style={{
                color: colors.text,
                border: `1px solid ${colors.border}`,
                backgroundColor: "#FFFFFF",
              }}
              type="button"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Main Home</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;