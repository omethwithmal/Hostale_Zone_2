import React, { useEffect, useRef } from "react";

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function About() {
  useScrollReveal();

  return (
    <div className="aboutPage">

      {/* ── Hero ── */}
      <section className="hero reveal">
        <div className="heroInner">
          <div className="heroBadge">
            <span className="badgeDot" />
            SLIIT Malabe Campus — Official Hostel System
          </div>
          <h1 className="heroTitle">
            Welcome to <span className="accent">SLIIT UniStay</span>
          </h1>
          <p className="heroDesc">
            The official hostel management platform for SLIIT Malabe — built to keep
            student accommodation simple, secure, and seamlessly connected.
          </p>
          <div className="heroStats">
            {[
              { num: "3",     label: "Hostel Blocks",    icon: "🏢" },
              { num: "24/7",  label: "Security Support",  icon: "🛡️" },
              { num: "Wi-Fi", label: "Connected Living",  icon: "📶" },
              { num: "100%",  label: "Student Focused",   icon: "🎓" },
            ].map((s, i) => (
              <div className="statCard" key={s.label} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <div className="statIcon">{s.icon}</div>
                <div className="statNum">{s.num}</div>
                <div className="statLabel">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="heroDeco heroDeco1" />
        <div className="heroDeco heroDeco2" />
        <div className="heroDeco heroDeco3" />
      </section>

      {/* ── Blocks ── */}
      <section className="section reveal">
        <div className="sectionHead reveal">
          <div className="sectionTag">Accommodation</div>
          <h2 className="sectionTitle">Our Hostel Blocks</h2>
          <p className="sectionDesc">Three dedicated blocks designed for comfort, safety, and academic focus.</p>
        </div>
        <div className="blocksGrid">
          {[
            { letter:"A", title:"Block A — Boys",   desc:"Secure, comfortable residence for male students with study-friendly common areas and round-the-clock supervision.", color:"#1D4ED8", bg:"rgba(29,78,216,0.07)",  bdr:"rgba(29,78,216,0.18)" },
            { letter:"B", title:"Block B — Girls",  desc:"Safe and well-managed residence for female students with enhanced security, privacy, and dedicated wardens.",      color:"#7C3AED", bg:"rgba(124,58,237,0.07)", bdr:"rgba(124,58,237,0.18)" },
            { letter:"C", title:"Block C — Faculty",desc:"Private, peaceful accommodation for lecturers and instructors, separate from student blocks with premium amenities.",color:"#0891B2", bg:"rgba(8,145,178,0.07)",  bdr:"rgba(8,145,178,0.18)" },
          ].map((b, i) => (
            <div
              className="blockCard reveal"
              key={b.letter}
              style={{ "--bc": b.color, "--bg": b.bg, "--bdr": b.bdr, transitionDelay: `${i * 0.12}s` }}
            >
              <div className="blockLetter" style={{ background: b.bg, color: b.color, border: `1.5px solid ${b.bdr}` }}>
                {b.letter}
              </div>
              <h3 className="blockTitle">{b.title}</h3>
              <p className="blockDesc">{b.desc}</p>
              <div className="blockBar" style={{ background: b.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section featureSection">
        <div className="sectionHead reveal">
          <div className="sectionTag">Platform</div>
          <h2 className="sectionTitle">What You Can Do</h2>
          <p className="sectionDesc">Everything a student needs, in one streamlined place.</p>
        </div>
        <div className="featGrid">
          {[
            { icon:"🛏️", title:"Room Selection",   desc:"Browse available rooms by block and book your preferred space with ease." },
            { icon:"📋", title:"Leave Requests",    desc:"Submit and track leave requests digitally — no paperwork, no queues." },
            { icon:"🔔", title:"Notifications",     desc:"Stay updated with hostel announcements and important alerts in real time." },
            { icon:"🖼️", title:"Gallery",           desc:"Explore photos of all blocks, rooms, and facilities before you move in." },
            { icon:"👤", title:"Student Profile",   desc:"Manage your personal details and hostel information from one dashboard." },
            { icon:"🔒", title:"Secure Access",     desc:"JWT-authenticated access ensures your data is always private and safe." },
          ].map((f, i) => (
            <div
              className="featCard reveal"
              key={f.title}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="featIcon">{f.icon}</div>
              <h4 className="featTitle">{f.title}</h4>
              <p className="featDesc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Facilities ── */}
      <section className="section reveal">
        <div className="sectionHead">
          <div className="sectionTag">Facilities</div>
          <h2 className="sectionTitle">Life at the Hostel</h2>
          <p className="sectionDesc">Everything designed to support comfortable student life and academic success.</p>
        </div>
        <div className="chips">
          {[
            "Free Wi-Fi","24-Hour Security","Clean Water & Electricity",
            "Study-Friendly Environment","Common Areas","Laundry Support",
            "Maintenance Requests","Hostel Announcements","CCTV Surveillance","Emergency Support",
          ].map((x, i) => (
            <span className="chip reveal" key={x} style={{ transitionDelay: `${i * 0.05}s` }}>{x}</span>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="section missionSection">
        <div className="missionLeft reveal">
          <div className="sectionTag">Our Mission</div>
          <h2 className="sectionTitle" style={{ marginTop: 10 }}>Why UniStay Exists</h2>
          <p className="missionText">
            Our mission is to provide a <strong>safe, comfortable, and technology-enabled</strong> hostel
            experience for every SLIIT student and staff member. UniStay replaces manual
            processes with a smart, connected system that keeps everyone informed.
          </p>
          <div className="missionList">
            {[
              "Simple and transparent room selection process",
              "Faster communication through real-time notifications",
              "Paperless leave request handling and tracking",
            ].map((m, i) => (
              <div className="missionRow reveal" key={m} style={{ transitionDelay: `${i * 0.1}s` }}>
                <span className="checkIcon">✓</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="missionRight reveal" style={{ transitionDelay: "0.2s" }}>
          <div className="missionCard">
            <div className="missionCardTop">
              <div className="logoCircle">U</div>
              <div>
                <div className="missionCardTitle">SLIIT UniStay</div>
                <div className="missionCardSub">Official Hostel System</div>
              </div>
            </div>
            <div className="missionDivider" />
            {[
              { label:"System Type",  val:"Web Application" },
              { label:"Institution",  val:"SLIIT Malabe" },
              { label:"Access",       val:"Student & Staff" },
              { label:"Support",      val:"24 / 7 Available" },
            ].map((r) => (
              <div className="missionInfoRow" key={r.label}>
                <span className="missionInfoLabel">{r.label}</span>
                <span className="missionInfoVal">{r.val}</span>
              </div>
            ))}
            <div className="missionPills">
              <span className="mPill">Secure</span>
              <span className="mPill">Modern</span>
              <span className="mPill">Simple</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="section reveal">
        <div className="sectionHead">
          <div className="sectionTag">Contact</div>
          <h2 className="sectionTitle">Location & Support</h2>
          <p className="sectionDesc">Reach out for any hostel-related queries or assistance.</p>
        </div>
        <div className="contactGrid">
          {[
            { icon:"📍", label:"Location", val:"SLIIT Malabe, New Kandy Road, Malabe, Sri Lanka" },
            { icon:"📧", label:"Email",    val:"unistay@sliit.lk" },
            { icon:"📞", label:"Phone",    val:"+94 11 754 4801" },
            { icon:"🕐", label:"Hours",    val:"24/7 Security  •  Office: 8:30 AM – 4:30 PM" },
          ].map((c, i) => (
            <div className="contactCard reveal" key={c.label} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="contactIcon">{c.icon}</div>
              <div>
                <div className="contactLabel">{c.label}</div>
                <div className="contactVal">{c.val}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="contactNote reveal">
          <strong>Note:</strong> This platform is purpose-built for SLIIT hostel services — covering
          Room Selection, Leave Requests, Notifications, and Gallery access. For urgent matters,
          contact the hostel office directly.
        </div>
      </section>

      {/* ── Styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .aboutPage {
          padding: 28px 32px 56px;
          min-height: 100vh;
          background: linear-gradient(170deg, #EFF6FF 0%, #F8FAFF 40%, #ffffff 100%);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #0B1B3A;
        }

        /* ════════════════════════════════
           SCROLL REVEAL
        ════════════════════════════════ */
        .reveal {
          opacity: 0;
          transform: translateY(36px);
          transition:
            opacity 0.65s cubic-bezier(0.22,1,0.36,1),
            transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ════════════════════════════════
           HERO
        ════════════════════════════════ */
        .hero {
          position: relative;
          background: linear-gradient(135deg,#1D4ED8 0%,#1e40af 55%,#1a3499 100%);
          border-radius: 24px;
          padding: 56px 48px 52px;
          color: #fff;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 24px 64px rgba(29,78,216,0.38);
        }
        .heroInner { position: relative; z-index: 2; }

        /* Decorative bubbles */
        .heroDeco {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .heroDeco1 { width:340px;height:340px; top:-120px; right:-80px; }
        .heroDeco2 { width:200px;height:200px; bottom:-80px; left:38%; background:rgba(255,255,255,0.04); }
        .heroDeco3 { width:120px;height:120px; top:30px; left:-40px; background:rgba(255,255,255,0.05); }

        .heroBadge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px; font-weight: 700; letter-spacing:0.04em;
          margin-bottom: 20px;
        }
        .badgeDot {
          width:8px;height:8px;border-radius:50%;
          background:#86EFAC;
          box-shadow:0 0 8px #86EFAC;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow:0 0 6px #86EFAC; }
          50%      { box-shadow:0 0 16px #86EFAC; }
        }

        .heroTitle {
          font-size: 44px; font-weight:900; letter-spacing:-1.2px;
          line-height:1.12; margin-bottom:14px;
        }
        .accent { color:#93C5FD; }

        .heroDesc {
          font-size:16px; color:rgba(255,255,255,0.82);
          line-height:1.65; max-width:560px; margin-bottom:32px;
        }

        .heroStats {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
        }
        .statCard {
          background:rgba(255,255,255,0.12);
          border:1px solid rgba(255,255,255,0.18);
          border-radius:18px; padding:18px 14px; text-align:center;
          backdrop-filter:blur(6px);
          transition: background 0.2s, transform 0.2s;
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .statCard:hover { background:rgba(255,255,255,0.2); transform:translateY(-3px); }
        .statIcon  { font-size:24px; margin-bottom:8px; }
        .statNum   { font-size:22px; font-weight:900; }
        .statLabel { font-size:12px; color:rgba(255,255,255,0.72); margin-top:4px; font-weight:600; }

        /* ════════════════════════════════
           SECTIONS
        ════════════════════════════════ */
        .section {
          background:#fff;
          border:1px solid rgba(29,78,216,0.09);
          border-radius:22px;
          padding:38px 34px;
          margin-bottom:20px;
          box-shadow:0 4px 24px rgba(29,78,216,0.06);
        }
        .sectionHead { margin-bottom:28px; }
        .sectionTag {
          display:inline-block;
          background:rgba(29,78,216,0.09);
          color:#1D4ED8;
          font-size:11px; font-weight:800;
          letter-spacing:0.1em; text-transform:uppercase;
          padding:5px 12px; border-radius:999px; margin-bottom:10px;
        }
        .sectionTitle {
          font-size:27px; font-weight:900; letter-spacing:-0.6px; color:#0B1B3A;
          margin-bottom:8px;
        }
        .sectionDesc {
          font-size:14px; color:rgba(11,27,58,0.6); line-height:1.6;
        }

        /* ════════════════════════════════
           BLOCKS
        ════════════════════════════════ */
        .blocksGrid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:16px;
        }
        .blockCard {
          border:1.5px solid var(--bdr);
          border-radius:18px;
          padding:26px 22px 22px;
          background:var(--bg);
          position:relative; overflow:hidden;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            opacity 0.65s cubic-bezier(0.22,1,0.36,1),
            translateY 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .blockCard:hover {
          transform:translateY(-5px);
          box-shadow:0 16px 36px rgba(29,78,216,0.13);
        }
        .blockLetter {
          width:52px;height:52px;border-radius:16px;
          display:grid;place-items:center;
          font-size:22px;font-weight:900;
          margin-bottom:16px;
        }
        .blockTitle { font-size:16px;font-weight:800;margin-bottom:8px;color:#0B1B3A; }
        .blockDesc  { font-size:13px;color:rgba(11,27,58,0.62);line-height:1.55; }
        .blockBar   { position:absolute;bottom:0;left:0;right:0;height:3px;opacity:0.55;border-radius:0 0 18px 18px; }

        /* ════════════════════════════════
           FEATURES
        ════════════════════════════════ */
        .featureSection { background:linear-gradient(150deg,#F0F7FF,#fff); }
        .featGrid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:16px;
        }
        .featCard {
          background:#fff;
          border:1px solid rgba(29,78,216,0.1);
          border-radius:16px; padding:24px 20px;
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            opacity 0.65s cubic-bezier(0.22,1,0.36,1),
            translateY 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .featCard:hover {
          transform:translateY(-4px);
          box-shadow:0 12px 30px rgba(29,78,216,0.1);
        }
        .featIcon  { font-size:28px;margin-bottom:14px; }
        .featTitle { font-size:15px;font-weight:800;margin-bottom:8px;color:#0B1B3A; }
        .featDesc  { font-size:13px;color:rgba(11,27,58,0.6);line-height:1.55; }

        /* ════════════════════════════════
           CHIPS
        ════════════════════════════════ */
        .chips { display:flex;flex-wrap:wrap;gap:10px; }
        .chip {
          background:rgba(29,78,216,0.07);
          border:1.5px solid rgba(29,78,216,0.15);
          color:#1D4ED8;
          padding:9px 17px; border-radius:999px;
          font-size:13px; font-weight:700;
          cursor:default;
          transition:
            background 0.2s, transform 0.2s,
            opacity 0.5s cubic-bezier(0.22,1,0.36,1),
            translateY 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .chip:hover { background:rgba(29,78,216,0.14); transform:translateY(-2px); }

        /* ════════════════════════════════
           MISSION
        ════════════════════════════════ */
        .missionSection {
          display:grid;
          grid-template-columns:1.2fr 0.8fr;
          gap:36px; align-items:center;
        }
        .missionText {
          font-size:14px;color:rgba(11,27,58,0.7);
          line-height:1.7;margin:12px 0 20px;
        }
        .missionList { display:grid;gap:10px; }
        .missionRow {
          display:flex;align-items:flex-start;gap:12px;
          padding:12px 14px;
          background:rgba(29,78,216,0.06);
          border:1px solid rgba(29,78,216,0.12);
          border-radius:12px;
          font-size:13px;font-weight:600;
          color:rgba(11,27,58,0.82); line-height:1.4;
        }
        .checkIcon {
          width:24px;height:24px;flex:0 0 auto;
          border-radius:8px;
          display:grid;place-items:center;
          background:rgba(29,78,216,0.14);
          color:#1D4ED8;font-weight:900;font-size:13px;
        }
        .missionCard {
          background:linear-gradient(160deg,#1D4ED8,#1a3a8f);
          border-radius:22px;padding:26px;color:#fff;
          box-shadow:0 24px 56px rgba(29,78,216,0.32);
        }
        .missionCardTop { display:flex;align-items:center;gap:14px;margin-bottom:18px; }
        .logoCircle {
          width:50px;height:50px;border-radius:14px;
          background:rgba(255,255,255,0.18);
          display:grid;place-items:center;
          font-size:22px;font-weight:900;
        }
        .missionCardTitle { font-weight:900;font-size:15px; }
        .missionCardSub   { font-size:12px;opacity:0.72;margin-top:3px; }
        .missionDivider   { height:1px;background:rgba(255,255,255,0.15);margin-bottom:14px; }
        .missionInfoRow {
          display:flex;justify-content:space-between;align-items:center;
          padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);
          font-size:13px;
        }
        .missionInfoRow:last-of-type { border-bottom:none; }
        .missionInfoLabel { color:rgba(255,255,255,0.62);font-weight:600; }
        .missionInfoVal   { color:#fff;font-weight:700; }
        .missionPills     { display:flex;gap:8px;margin-top:14px;flex-wrap:wrap; }
        .mPill {
          font-size:12px;font-weight:700;
          padding:6px 12px;border-radius:999px;
          background:rgba(255,255,255,0.13);
          border:1px solid rgba(255,255,255,0.18);
        }

        /* ════════════════════════════════
           CONTACT
        ════════════════════════════════ */
        .contactGrid {
          display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;margin-bottom:16px;
        }
        .contactCard {
          display:flex;align-items:flex-start;gap:14px;
          padding:18px;
          border:1px solid rgba(29,78,216,0.1);
          border-radius:16px;background:#F8FAFF;
          transition:border-color 0.2s,box-shadow 0.2s,transform 0.2s;
        }
        .contactCard:hover {
          border-color:rgba(29,78,216,0.25);
          box-shadow:0 8px 24px rgba(29,78,216,0.09);
          transform:translateY(-2px);
        }
        .contactIcon {
          font-size:22px;
          width:46px;height:46px;flex:0 0 auto;
          border-radius:13px;
          background:rgba(29,78,216,0.09);
          display:grid;place-items:center;
        }
        .contactLabel {
          font-size:11px;font-weight:800;text-transform:uppercase;
          letter-spacing:0.08em;color:rgba(11,27,58,0.5);margin-bottom:5px;
        }
        .contactVal { font-size:13px;font-weight:700;color:#0B1B3A;line-height:1.45; }
        .contactNote {
          padding:14px 18px;border-radius:14px;
          background:rgba(29,78,216,0.06);
          border:1px solid rgba(29,78,216,0.13);
          font-size:13px;color:rgba(11,27,58,0.72);line-height:1.55;
        }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */
        @media(max-width:1080px){
          .heroStats      { grid-template-columns:repeat(2,1fr); }
          .blocksGrid     { grid-template-columns:1fr; }
          .featGrid       { grid-template-columns:repeat(2,1fr); }
          .missionSection { grid-template-columns:1fr; }
        }
        @media(max-width:640px){
          .aboutPage  { padding:14px 14px 40px; }
          .hero       { padding:32px 20px 28px; }
          .heroTitle  { font-size:28px; }
          .heroStats  { grid-template-columns:repeat(2,1fr); }
          .featGrid   { grid-template-columns:1fr; }
          .contactGrid{ grid-template-columns:1fr; }
          .section    { padding:24px 18px; }
        }
      `}</style>
    </div>
  );
}