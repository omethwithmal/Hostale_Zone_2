import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const RoomManagementSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          path: '/RoomManagementDashboard',
          label: 'Dashboard',
          badge: null,
          gradient: 'from-indigo-600 to-purple-600',
          color: '#818cf8',
          glow: 'rgba(129,140,248,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <rect x="3" y="3" width="7" height="7" rx="2"/>
              <rect x="14" y="3" width="7" height="7" rx="2"/>
              <rect x="3" y="14" width="7" height="7" rx="2"/>
              <rect x="14" y="14" width="7" height="7" rx="2"/>
            </svg>
          ),
        },
      ],
    },
    {
      group: 'Requests',
      items: [
        {
          path: '/room-change-request',
          label: 'Room Change',
          badge: '3',
          gradient: 'from-blue-600 to-cyan-500',
          color: '#38bdf8',
          glow: 'rgba(56,189,248,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h3"/>
              <path d="M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3"/>
              <path d="M12 8l-4 4 4 4M8 12h8"/>
            </svg>
          ),
        },
        {
          path: '/RoomTransferRequest',
          label: 'Transfer',
          badge: '12',
          gradient: 'from-rose-600 to-pink-500',
          color: '#fb7185',
          glow: 'rgba(251,113,133,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          ),
        },
        {
          path: '/waiting-list',
          label: 'Waiting List',
          badge: '28',
          gradient: 'from-amber-500 to-orange-500',
          color: '#fbbf24',
          glow: 'rgba(251,191,36,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          ),
        },
      ],
    },
    {
      group: 'Rooms',
      items: [
        {
          path: '/RoomDetailsForm',
          label: 'Room Details',
          badge: null,
          gradient: 'from-emerald-600 to-teal-500',
          color: '#34d399',
          glow: 'rgba(52,211,153,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          ),
        },
        {
          path: '/assign-rooms',
          label: 'Assign Rooms',
          badge: '24',
          gradient: 'from-violet-600 to-purple-500',
          color: '#a78bfa',
          glow: 'rgba(167,139,250,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          ),
        },
        {
          path: '/blocks',
          label: 'Blocks & Floors',
          badge: null,
          gradient: 'from-sky-600 to-blue-500',
          color: '#7dd3fc',
          glow: 'rgba(125,211,252,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          ),
        },
      ],
    },
    {
      group: 'People',
      items: [
        {
          path: '/students',
          label: 'Students',
          badge: null,
          gradient: 'from-orange-500 to-amber-500',
          color: '#fb923c',
          glow: 'rgba(251,146,60,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          ),
        },
        {
          path: '/reports',
          label: 'Reports',
          badge: null,
          gradient: 'from-teal-600 to-cyan-500',
          color: '#2dd4bf',
          glow: 'rgba(45,212,191,0.5)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
              <line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
          ),
        },
      ],
    },
    {
      group: 'System',
      items: [
        {
          path: '/settings',
          label: 'Settings',
          badge: null,
          gradient: 'from-slate-500 to-gray-500',
          color: '#94a3b8',
          glow: 'rgba(148,163,184,0.4)',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          ),
        },
      ],
    },
  ];

  const W = collapsed ? 80 : 260;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .rms * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }

        /* ─── Sidebar shell ─────────────────────────── */
        .rms-aside {
          width: ${W}px;
          min-height: 100vh;
          position: relative;
          flex-shrink: 0;
          transition: width 0.35s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Glass background matching dashboard */
        .rms-bg {
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          border-right: 1px solid rgba(255,255,255,0.6);
          box-shadow: 4px 0 24px rgba(99,102,241,0.08), 1px 0 0 rgba(255,255,255,0.8) inset;
          z-index: 0;
        }

        /* Subtle mesh gradient orbs */
        .rms-orb1 {
          position: absolute; top: -60px; left: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
          animation: rms-float 8s ease-in-out infinite;
        }
        .rms-orb2 {
          position: absolute; bottom: 100px; right: -80px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
          animation: rms-float 10s ease-in-out infinite reverse;
        }
        @keyframes rms-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }

        /* Top gradient bar */
        .rms-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1);
          background-size: 300% 100%;
          animation: rms-slide 4s linear infinite;
          z-index: 2;
        }
        @keyframes rms-slide {
          0% { background-position: 0% 0%; }
          100% { background-position: 300% 0%; }
        }

        /* All content above bg */
        .rms-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100vh; }

        /* ─── Toggle button ─────────────────────────── */
        .rms-toggle {
          position: absolute;
          top: 24px;
          right: -13px;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: white;
          border: 1.5px solid rgba(99,102,241,0.25);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #6366f1;
          transition: all 0.2s;
          z-index: 10;
          box-shadow: 0 4px 14px rgba(99,102,241,0.2);
        }
        .rms-toggle:hover {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 18px rgba(99,102,241,0.4);
          transform: scale(1.1);
        }
        .rms-toggle svg {
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          transform: ${collapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
        }

        /* ─── Header ────────────────────────────────── */
        .rms-header {
          padding: ${collapsed ? '22px 0 18px' : '22px 18px 18px'};
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          gap: 12px;
          border-bottom: 1px solid rgba(99,102,241,0.1);
        }
        .rms-logo {
          width: 44px; height: 44px;
          border-radius: 13px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 8px 20px rgba(99,102,241,0.35);
          flex-shrink: 0;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
        }
        .rms-logo:hover {
          transform: rotate(-6deg) scale(1.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.25), 0 12px 28px rgba(99,102,241,0.5);
        }
        .rms-brandwrap { overflow: hidden; }
        .rms-brandname {
          font-size: 16px; font-weight: 800; letter-spacing: -0.5px;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }
        .rms-brandsub {
          font-size: 9.5px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #a5b4fc;
          white-space: nowrap; margin-top: 2px;
          display: block;
        }

        /* ─── Scroll area ───────────────────────────── */
        .rms-scroll {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 10px 0;
        }
        .rms-scroll::-webkit-scrollbar { width: 3px; }
        .rms-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 3px; }

        /* ─── Group ─────────────────────────────────── */
        .rms-group { margin-bottom: 4px; }
        .rms-grouplabel {
          font-size: 9px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(99,102,241,0.4);
          padding: ${collapsed ? '10px 0 5px' : '10px 20px 5px'};
          text-align: ${collapsed ? 'center' : 'left'};
          white-space: nowrap; overflow: hidden;
          transition: all 0.3s;
        }

        /* ─── Nav item ──────────────────────────────── */
        .rms-item {
          position: relative;
          display: flex; align-items: center;
          gap: 10px;
          margin: 2px 10px;
          height: 46px;
          padding: ${collapsed ? '0' : '0 12px'};
          border-radius: 14px;
          text-decoration: none;
          color: #64748b;
          font-size: 13.5px; font-weight: 600;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          cursor: pointer;
        }
        .rms-item:hover {
          color: #1e1b4b;
          background: rgba(99,102,241,0.07);
          border-color: rgba(99,102,241,0.12);
        }
        .rms-item.active {
          color: #4338ca;
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.18);
          box-shadow: 0 4px 16px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.8);
        }

        /* active left accent */
        .rms-item.active::before {
          content: '';
          position: absolute;
          left: -10px; top: 50%;
          transform: translateY(-50%);
          width: 3.5px; height: 26px;
          border-radius: 0 4px 4px 0;
        }

        /* icon pill */
        .rms-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(99,102,241,0.07);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .rms-item.active .rms-icon {
          background: white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        /* label */
        .rms-label {
          flex: 1; white-space: nowrap; overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          max-width: ${collapsed ? '0' : '160px'};
          transition: opacity 0.25s, max-width 0.35s;
        }

        /* badge */
        .rms-badge {
          min-width: 22px; height: 20px;
          border-radius: 99px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800;
          padding: 0 6px; flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
        }

        /* tooltip (collapsed) */
        .rms-tooltip {
          position: absolute;
          left: calc(100% + 14px); top: 50%;
          transform: translateY(-50%) translateX(4px);
          background: white;
          border: 1px solid rgba(99,102,241,0.18);
          color: #1e1b4b;
          font-size: 12.5px; font-weight: 700;
          padding: 7px 13px;
          border-radius: 11px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 8px 24px rgba(99,102,241,0.15);
          z-index: 999;
          display: flex; align-items: center; gap: 8px;
        }
        .rms-tooltip::before {
          content: '';
          position: absolute;
          left: -5px; top: 50%;
          width: 8px; height: 8px;
          background: white;
          border-left: 1px solid rgba(99,102,241,0.18);
          border-bottom: 1px solid rgba(99,102,241,0.18);
          transform: translateY(-50%) rotate(45deg);
        }
        .rms-item:hover .rms-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* divider */
        .rms-divider { height: 1px; background: rgba(99,102,241,0.08); margin: 6px 14px; }

        /* ─── Footer ────────────────────────────────── */
        .rms-footer {
          padding: ${collapsed ? '14px 0' : '14px 12px'};
          border-top: 1px solid rgba(99,102,241,0.1);
        }

        /* system health mini card */
        .rms-health {
          display: flex; align-items: center;
          gap: 9px;
          padding: 10px 11px;
          border-radius: 13px;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06));
          border: 1px solid rgba(99,102,241,0.12);
          margin-bottom: 10px;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
        }
        .rms-health-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34,197,94,0.7);
          animation: rms-pulse 2s infinite;
          flex-shrink: 0;
        }
        @keyframes rms-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.25); }
        }
        .rms-health-text {
          font-size: 11.5px; font-weight: 700;
          color: #4338ca;
          opacity: ${collapsed ? 0 : 1};
          max-width: ${collapsed ? '0' : '160px'};
          overflow: hidden; white-space: nowrap;
          transition: opacity 0.25s, max-width 0.35s;
        }

        /* user card */
        .rms-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 10px;
          border-radius: 13px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
        }
        .rms-user:hover {
          background: rgba(99,102,241,0.07);
          border-color: rgba(99,102,241,0.12);
        }
        .rms-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 800;
          box-shadow: 0 0 0 2.5px rgba(99,102,241,0.2), 0 4px 12px rgba(99,102,241,0.3);
          flex-shrink: 0; position: relative;
          letter-spacing: -0.5px;
        }
        .rms-online {
          position: absolute; bottom: -2px; right: -2px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #22c55e; border: 2.5px solid white;
          box-shadow: 0 0 6px rgba(34,197,94,0.8);
        }
        .rms-userinfo {
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          max-width: ${collapsed ? '0' : '160px'};
          transition: opacity 0.25s, max-width 0.35s;
          flex: 1;
        }
        .rms-uname { font-size: 13px; font-weight: 700; color: #1e1b4b; white-space: nowrap; }
        .rms-urole { font-size: 11px; color: #94a3b8; font-weight: 500; white-space: nowrap; margin-top: 1px; }
        .rms-more {
          color: #a5b4fc; flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
        }
      `}</style>

      <div className="rms">
        <aside className="rms-aside">
          {/* BG layers */}
          <div className="rms-bg" />
          <div className="rms-orb1" />
          <div className="rms-orb2" />
          <div className="rms-topbar" />

          {/* Collapse toggle */}
          <button className="rms-toggle" onClick={() => setCollapsed(v => !v)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="rms-content">
            {/* Header */}
            <div className="rms-header">
              <div className="rms-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              {!collapsed && (
                <div className="rms-brandwrap">
                  <span className="rms-brandname">RoomHive</span>
                  <span className="rms-brandsub">Hostel Management</span>
                </div>
              )}
            </div>

            {/* Nav groups */}
            <div className="rms-scroll">
              {navGroups.map((group) => (
                <div className="rms-group" key={group.group}>
                  <div className="rms-grouplabel">
                    {collapsed ? '·' : group.group}
                  </div>

                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`rms-item${isActive ? ' active' : ''}`}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <span style={{
                            position: 'absolute',
                            left: -10, top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3.5, height: 26,
                            borderRadius: '0 4px 4px 0',
                            background: `linear-gradient(180deg, ${item.color}, ${item.color}88)`,
                            boxShadow: `0 0 10px ${item.glow}`,
                          }} />
                        )}

                        {/* Icon */}
                        <div
                          className="rms-icon"
                          style={isActive ? {
                            color: item.color,
                            background: 'white',
                            boxShadow: `0 3px 12px ${item.glow}`,
                          } : { color: '#94a3b8' }}
                        >
                          {item.icon}
                        </div>

                        {/* Label */}
                        <span className="rms-label">{item.label}</span>

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className="rms-badge"
                            style={{
                              background: `linear-gradient(135deg, ${item.color}22, ${item.color}15)`,
                              color: item.color,
                              border: `1px solid ${item.color}40`,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Tooltip */}
                        {collapsed && (
                          <span className="rms-tooltip">
                            <span style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: item.color,
                              boxShadow: `0 0 6px ${item.glow}`,
                              flexShrink: 0,
                            }} />
                            {item.label}
                            {item.badge && (
                              <span style={{
                                padding: '1px 7px', borderRadius: 99,
                                background: `${item.color}22`,
                                color: item.color,
                                fontSize: 10, fontWeight: 800,
                                border: `1px solid ${item.color}40`,
                              }}>
                                {item.badge}
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="rms-footer">
              {/* System health */}
              <div className="rms-health">
                <span className="rms-health-dot" />
                <span className="rms-health-text">System Active · 98.5%</span>
              </div>

              <div className="rms-divider" />

              {/* User */}
              <div className="rms-user">
                <div className="rms-avatar">
                  AD
                  <span className="rms-online" />
                </div>
                <div className="rms-userinfo">
                  <div className="rms-uname">Admin User</div>
                  <div className="rms-urole">Hostel Administrator</div>
                </div>
                {!collapsed && (
                  <div className="rms-more">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5"/>
                      <circle cx="12" cy="12" r="1.5"/>
                      <circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default RoomManagementSidebar;