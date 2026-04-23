import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const RoomManagementNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: 'Request Approved',
      message: 'Your room change request #RCR-2024-001 has been approved.',
      time: '2 min ago',
      icon: '✓',
      bg: 'linear-gradient(135deg,#0d9488,#14b8a6)',
    },
    {
      id: 2,
      title: 'Pending Review',
      message: 'Transfer request #TRQ-2024-045 is under admin review.',
      time: '1 hr ago',
      icon: '⏳',
      bg: 'linear-gradient(135deg,#d97706,#f59e0b)',
    },
    {
      id: 3,
      title: 'Room Available',
      message: 'Block B Room 205 is now available for booking.',
      time: '3 hrs ago',
      icon: '🏠',
      bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    },
    {
      id: 4,
      title: 'Document Required',
      message: 'Please upload medical certificate for your request.',
      time: '1 day ago',
      icon: '📎',
      bg: 'linear-gradient(135deg,#e11d48,#fb7185)',
    },
  ];

  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

  const navItems = [
    {
      path: '/RoomManagementDashboard',
      label: 'Dashboard',
      color: '#a78bfa',
      glow: 'rgba(167,139,250,0.45)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      path: '/room-change-request',
      label: 'Room Change',
      color: '#38bdf8',
      glow: 'rgba(56,189,248,0.45)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
          <path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h3"/>
          <path d="M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3"/>
          <path d="M12 8l-4 4 4 4M8 12h8"/>
        </svg>
      ),
    },
    {
      path: '/RoomDetailsForm',
      label: 'Room Details',
      color: '#34d399',
      glow: 'rgba(52,211,153,0.45)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
    },
    {
      path: '/RoomTransferRequest',
      label: 'Transfer',
      color: '#f472b6',
      glow: 'rgba(244,114,182,0.45)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
          <path d="M5 12h14M15 6l6 6-6 6"/>
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setReadNotifications(notifications.map(n => n.id));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .rmn-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; margin:0; padding:0; }

    .rmn-bar {
      background: linear-gradient(160deg, #0f0c29 0%, #1a1040 45%, #0c1b3a 100%);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 40px rgba(0,0,0,0.55);
      position: sticky; top: 0; z-index: 100; overflow: visible;
    }
    .rmn-aurora {
      height: 2.5px;
      background: linear-gradient(90deg, #a78bfa, #38bdf8, #34d399, #f472b6, #a78bfa);
      background-size: 300% 100%;
      animation: aurora 5s linear infinite;
    }
    @keyframes aurora { 0%{background-position:0%} 100%{background-position:300%} }

    .rmn-inner {
      max-width: 1400px; margin: 0 auto;
      padding: 0 36px; height: 80px;
      display: flex; align-items: center; justify-content: space-between; gap: 20px;
    }

    /* Brand */
    .rmn-brand { display:flex; align-items:center; gap:13px; text-decoration:none; flex-shrink:0; }
    .rmn-logo {
      width: 50px; height: 50px; border-radius: 15px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 1px rgba(167,139,250,0.3), 0 10px 30px rgba(124,58,237,0.55);
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
      flex-shrink: 0;
    }
    .rmn-brand:hover .rmn-logo {
      transform: translateY(-3px) rotate(-5deg);
      box-shadow: 0 0 0 1px rgba(167,139,250,0.5), 0 16px 40px rgba(124,58,237,0.7);
    }
    .rmn-brand-words { display:flex; flex-direction:column; line-height:1.15; }
    .rmn-brand-name {
      font-size: 19px; font-weight: 800; letter-spacing: -0.6px;
      background: linear-gradient(90deg, #e0d7ff, #fff);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .rmn-brand-sub {
      font-size: 10px; font-weight: 600; letter-spacing: 1.8px; text-transform: uppercase;
      color: rgba(167,139,250,0.75);
    }

    /* Nav */
    .rmn-nav { display:flex; align-items:center; gap:5px; flex:1; justify-content:center; }
    .rmn-link {
      position: relative; display:flex; align-items:center; justify-content:center;
      padding: 8px; border-radius: 14px; text-decoration:none;
      font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.45);
      transition: all 0.22s ease;
      border: 1px solid transparent;
    }
    .rmn-link:hover { color:rgba(255,255,255,0.85); background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.08); }
    .rmn-link.active { color:#fff; background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.12); box-shadow:0 4px 20px rgba(0,0,0,0.3); }
    .rmn-link-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display:flex; align-items:center; justify-content:center;
      background: rgba(255,255,255,0.05); transition: all 0.22s; flex-shrink:0;
      cursor: pointer;
    }
    .rmn-link-bar {
      position:absolute; bottom:-1px; left:50%; transform:translateX(-50%);
      width:28px; height:3px; border-radius:99px; opacity:0;
      transition:opacity 0.22s; filter:blur(0.5px);
    }
    .rmn-link.active .rmn-link-bar { opacity:1; }

    /* Actions */
    .rmn-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }

    .rmn-search-pill {
      display:flex; align-items:center; gap:8px;
      padding: 9px 15px; border-radius: 12px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.38); font-size:13px; font-weight:500; cursor:pointer;
      transition: all 0.2s;
    }
    .rmn-search-pill:hover { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.65); border-color:rgba(255,255,255,0.15); }
    .rmn-kbd {
      padding:2px 7px; border-radius:6px; background:rgba(255,255,255,0.07);
      font-size:11px; font-weight:700; color:rgba(255,255,255,0.22); letter-spacing:0.5px;
    }

    .rmn-icon-btn {
      width:46px; height:46px; border-radius:13px;
      border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.06);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; position:relative; transition:all 0.2s;
      color:rgba(255,255,255,0.5);
    }
    .rmn-icon-btn:hover {
      background:rgba(255,255,255,0.11); border-color:rgba(255,255,255,0.16);
      color:#fff; transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.4);
    }
    .rmn-badge {
      position:absolute; top:-6px; right:-6px;
      min-width:20px; height:20px;
      background:linear-gradient(135deg,#f43f5e,#fb7185);
      color:#fff; font-size:10px; font-weight:800;
      border-radius:99px; display:flex; align-items:center; justify-content:center;
      padding:0 5px; border:2.5px solid #0f0c29;
      box-shadow:0 4px 12px rgba(244,63,94,0.65);
      animation:badge-pop 0.35s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes badge-pop { from{transform:scale(0)} to{transform:scale(1)} }

    .rmn-profile-btn {
      display:flex; align-items:center; gap:10px;
      padding:6px 13px 6px 6px; border-radius:15px;
      border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.06);
      cursor:pointer; transition:all 0.22s;
    }
    .rmn-profile-btn:hover {
      background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.16);
      transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,0.45);
    }
    .rmn-avatar {
      width:38px; height:38px; border-radius:11px;
      background:linear-gradient(135deg,#7c3aed,#a78bfa);
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-size:13px; font-weight:800; flex-shrink:0;
      box-shadow:0 0 0 2.5px rgba(167,139,250,0.35);
      letter-spacing:-0.5px; position:relative;
    }
    .rmn-online-dot {
      position:absolute; bottom:-2px; right:-2px;
      width:10px; height:10px; border-radius:50%;
      background:#22c55e; border:2.5px solid #0f0c29;
      box-shadow:0 0 8px rgba(34,197,94,0.8);
    }
    .rmn-pname { font-size:13.5px; font-weight:700; color:rgba(255,255,255,0.9); white-space:nowrap; }
    .rmn-prole { font-size:11px; font-weight:500; color:rgba(255,255,255,0.35); margin-top:1px; }
    .rmn-chevron { color:rgba(255,255,255,0.3); transition:transform 0.2s; flex-shrink:0; }
    .rmn-chevron.open { transform:rotate(180deg); }

    /* Dropdown base */
    .rmn-drop {
      position:absolute; top:calc(100% + 12px); right:0;
      background:linear-gradient(160deg,#1c1040,#0e1a3d);
      border:1px solid rgba(255,255,255,0.1); border-radius:20px;
      box-shadow:0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset;
      z-index:300; overflow:hidden;
      animation:drop-in 0.22s cubic-bezier(.34,1.1,.64,1);
    }
    @keyframes drop-in {
      from{opacity:0;transform:translateY(-10px) scale(0.96)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }

    /* Notif */
    .rmn-ndrop { width:390px; }
    .rmn-ndrop-head {
      padding:18px 22px 14px;
      display:flex; align-items:center; justify-content:space-between;
      border-bottom:1px solid rgba(255,255,255,0.07);
    }
    .rmn-ndrop-title { font-size:16px; font-weight:800; color:#fff; letter-spacing:-0.3px; }
    .rmn-new-badge {
      padding:3px 10px; border-radius:99px;
      background:rgba(167,139,250,0.18); color:#a78bfa;
      font-size:11px; font-weight:700;
    }
    .rmn-mark-btn {
      font-size:12px; font-weight:700; color:#a78bfa;
      padding:4px 11px; border-radius:8px; border:none;
      background:rgba(167,139,250,0.12); cursor:pointer; transition:background 0.15s;
    }
    .rmn-mark-btn:hover { background:rgba(167,139,250,0.22); }
    .rmn-nlist { max-height:320px; overflow-y:auto; }
    .rmn-nlist::-webkit-scrollbar { width:3px; }
    .rmn-nlist::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
    .rmn-nitem {
      display:flex; align-items:flex-start; gap:13px;
      padding:14px 22px; cursor:pointer;
      border-bottom:1px solid rgba(255,255,255,0.04);
      transition:background 0.15s; position:relative;
    }
    .rmn-nitem:hover { background:rgba(255,255,255,0.04); }
    .rmn-nitem:last-child { border-bottom:none; }
    .rmn-nitem.unread::after {
      content:''; position:absolute;
      left:9px; top:50%; transform:translateY(-50%);
      width:5px; height:5px; border-radius:50%;
      background:#a78bfa; box-shadow:0 0 6px #a78bfa;
    }
    .rmn-nicon {
      width:42px; height:42px; border-radius:12px;
      display:flex; align-items:center; justify-content:center;
      font-size:18px; flex-shrink:0;
    }
    .rmn-nbody { flex:1; min-width:0; }
    .rmn-ntitle { font-size:13px; font-weight:700; color:rgba(255,255,255,0.9); margin-bottom:3px; }
    .rmn-nmsg { font-size:12px; color:rgba(255,255,255,0.42); line-height:1.45; }
    .rmn-ntime { font-size:11px; color:rgba(255,255,255,0.25); font-weight:500; margin-top:5px; }
    .rmn-nfoot {
      padding:13px 22px; border-top:1px solid rgba(255,255,255,0.07); text-align:center;
    }
    .rmn-nfoot a {
      font-size:13px; color:#a78bfa; font-weight:700; text-decoration:none;
      display:inline-flex; align-items:center; gap:5px;
    }
    .rmn-nfoot a:hover { color:#c4b5fd; }

    /* Profile drop */
    .rmn-pdrop { width:265px; }
    .rmn-pdrop-banner {
      height:70px; position:relative;
      background:linear-gradient(135deg,#4c1d95,#1e3a8a);
      overflow:hidden;
    }
    .rmn-pdrop-banner::before {
      content:'';position:absolute;inset:0;
      background:radial-gradient(circle at 70% 50%, rgba(167,139,250,0.25) 0%, transparent 60%);
    }
    .rmn-pdrop-av-wrap { position:absolute; bottom:-24px; left:20px; }
    .rmn-pdrop-av {
      width:52px; height:52px; border-radius:15px;
      background:linear-gradient(135deg,#7c3aed,#a78bfa);
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-size:19px; font-weight:800;
      border:3px solid #1c1040;
      box-shadow:0 10px 30px rgba(124,58,237,0.6);
      letter-spacing:-0.5px;
    }
    .rmn-pdrop-info {
      padding:34px 20px 14px;
      border-bottom:1px solid rgba(255,255,255,0.07);
    }
    .rmn-pdrop-name { font-size:15px; font-weight:800; color:#fff; letter-spacing:-0.3px; }
    .rmn-pdrop-email { font-size:12px; color:rgba(255,255,255,0.38); margin-top:2px; }
    .rmn-pdrop-pill {
      display:inline-flex; align-items:center; gap:5px;
      margin-top:9px; padding:3px 11px; border-radius:99px;
      background:rgba(167,139,250,0.15); border:1px solid rgba(167,139,250,0.25);
      color:#c4b5fd; font-size:11px; font-weight:700;
    }
    .rmn-pmitem {
      display:flex; align-items:center; gap:11px;
      padding:12px 20px; text-decoration:none;
      color:rgba(255,255,255,0.58); font-size:13.5px; font-weight:600;
      transition:all 0.15s; cursor:pointer; border:none; background:none;
      width:100%; text-align:left;
    }
    .rmn-pmitem:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.95); padding-left:24px; }
    .rmn-pmicon {
      width:32px; height:32px; border-radius:9px;
      background:rgba(255,255,255,0.07);
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; transition:background 0.15s;
    }
    .rmn-pmitem:hover .rmn-pmicon { background:rgba(167,139,250,0.18); }
    .rmn-pmitem.danger { color:rgba(251,113,133,0.72); }
    .rmn-pmitem.danger:hover { color:#fb7185; background:rgba(244,63,94,0.06); }
    .rmn-pmitem.danger:hover .rmn-pmicon { background:rgba(244,63,94,0.14); }
    .rmn-divider { height:1px; background:rgba(255,255,255,0.06); margin:4px 0; }

    /* Mobile */
    .rmn-burger {
      width:46px; height:46px; border-radius:13px;
      border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.06);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:rgba(255,255,255,0.6); transition:all 0.18s;
    }
    .rmn-burger:hover { background:rgba(255,255,255,0.11); color:#fff; }
    .rmn-mobile {
      border-top:1px solid rgba(255,255,255,0.07);
      padding:12px 24px 20px; display:grid; gap:4px;
      animation:drop-in 0.2s ease;
    }
    .rmn-mlink {
      display:flex; align-items:center; gap:13px;
      padding:12px 16px; border-radius:14px; text-decoration:none;
      color:rgba(255,255,255,0.48); font-size:14.5px; font-weight:600;
      border:1px solid transparent; transition:all 0.18s;
    }
    .rmn-mlink:hover { color:rgba(255,255,255,0.88); background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.07); }
    .rmn-mlink.active { color:#fff; background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.1); }
    .rmn-mlink-icon {
      width:38px; height:38px; border-radius:11px;
      display:flex; align-items:center; justify-content:center;
      background:rgba(255,255,255,0.06); flex-shrink:0;
    }

    @media (max-width:900px) { .rmn-nav, .rmn-search-pill, .rmn-pname, .rmn-prole { display:none !important; } }
    @media (min-width:901px) { .rmn-burger { display:none !important; } }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rmn-root">
        <nav className="rmn-bar">
          <div className="rmn-aurora" />

          <div className="rmn-inner">
            {/* ── Brand ── */}
            <Link to="/RoomManagementDashboard" className="rmn-brand">
              <div className="rmn-logo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <div className="rmn-brand-words">
                <span className="rmn-brand-name">RoomHive</span>
                <span className="rmn-brand-sub">Hostel Management</span>
              </div>
            </Link>



            {/* ── Actions ── */}
            <div className="rmn-actions">
              {/* Search */}
              <div className="rmn-search-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search…
                <span className="rmn-kbd">⌘K</span>
              </div>

              {/* Notifications */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  className="rmn-icon-btn"
                  onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                  {unreadCount > 0 && <span className="rmn-badge">{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="rmn-drop rmn-ndrop">
                    <div className="rmn-ndrop-head">
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <span className="rmn-ndrop-title">Notifications</span>
                        {unreadCount > 0 && <span className="rmn-new-badge">{unreadCount} new</span>}
                      </div>
                      {unreadCount > 0 && (
                        <button className="rmn-mark-btn" onClick={markAllRead}>Mark all read</button>
                      )}
                    </div>
                    <div className="rmn-nlist">
                      {notifications.map(n => {
                        const unread = !readNotifications.includes(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`rmn-nitem${unread ? ' unread' : ''}`}
                            onClick={() => setReadNotifications(p => [...p, n.id])}
                          >
                            <div className="rmn-nicon" style={{ background: n.bg }}>
                              <span style={{ filter:'brightness(10)' }}>{n.icon}</span>
                            </div>
                            <div className="rmn-nbody">
                              <div className="rmn-ntitle">{n.title}</div>
                              <div className="rmn-nmsg">{n.message}</div>
                              <div className="rmn-ntime">{n.time}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rmn-nfoot">
                      <Link to="/notifications" onClick={() => setShowNotifications(false)}>
                        View all notifications
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button
                  className="rmn-profile-btn"
                  onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
                >
                  <div className="rmn-avatar">
                    SP
                    <span className="rmn-online-dot" />
                  </div>
                  <div>
                    <div className="rmn-pname">Saman Perera</div>
                    <div className="rmn-prole">Male Student</div>
                  </div>
                  <svg
                    className={`rmn-chevron${showProfile ? ' open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {showProfile && (
                  <div className="rmn-drop rmn-pdrop">
                    <div className="rmn-pdrop-banner">
                      <div className="rmn-pdrop-av-wrap">
                        <div className="rmn-pdrop-av">SP</div>
                      </div>
                    </div>
                    <div className="rmn-pdrop-info">
                      <div className="rmn-pdrop-name">Saman Perera</div>
                      <div className="rmn-pdrop-email">saman@university.edu</div>
                      <div className="rmn-pdrop-pill">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
                        </svg>
                        Male Student · Block A
                      </div>
                    </div>
                    <div style={{ padding:'6px 0' }}>
                      <Link to="/profile" className="rmn-pmitem" onClick={() => setShowProfile(false)}>
                        <div className="rmn-pmicon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        My Profile
                      </Link>
                      <Link to="/my-requests" className="rmn-pmitem" onClick={() => setShowProfile(false)}>
                        <div className="rmn-pmicon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        </div>
                        My Requests
                      </Link>
                      <Link to="/settings" className="rmn-pmitem" onClick={() => setShowProfile(false)}>
                        <div className="rmn-pmicon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                          </svg>
                        </div>
                        Settings
                      </Link>
                      <div className="rmn-divider" />
                      <button className="rmn-pmitem danger" onClick={() => setShowProfile(false)}>
                        <div className="rmn-pmicon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                            <polyline points="16,17 21,12 16,7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Burger */}
              <button className="rmn-burger" onClick={() => setIsMenuOpen(v => !v)}>
                {isMenuOpen
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="rmn-mobile">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rmn-mlink${isActive ? ' active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div
                      className="rmn-mlink-icon"
                      style={isActive
                        ? { background: item.color + '22', color: item.color }
                        : { color: 'rgba(255,255,255,0.35)' }
                      }
                    >
                      {item.icon}
                    </div>
                    {item.label}
                    {isActive && (
                      <span style={{
                        marginLeft:'auto', width:7, height:7,
                        borderRadius:'50%', background:item.color,
                        boxShadow:`0 0 8px ${item.color}`,
                        flexShrink:0,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default RoomManagementNavbar;