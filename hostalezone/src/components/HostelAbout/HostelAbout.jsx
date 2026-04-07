import React, { useEffect } from "react";

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

export default function HostelAbout() {
  useScrollReveal();

  return (
    <div className="px-4 py-6 md:px-8 md:py-7 lg:px-10 lg:py-14 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white font-sans text-slate-900">
      {/* Global Styles for scroll reveal and keyframes */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 6px #86efac; }
          50% { box-shadow: 0 0 16px #86efac; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 md:p-12 lg:p-14 text-white overflow-hidden shadow-2xl shadow-blue-500/30 mb-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide mb-5">
            <span className="w-2 h-2 rounded-full bg-green-300 shadow-md shadow-green-300/50 animate-[pulse_2s_ease-in-out_infinite]" />
            SLIIT Malabe Campus — Official Hostel System
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Welcome to <span className="text-blue-200">SLIIT UniStay</span>
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed mt-4 mb-8">
            The official hostel management platform for SLIIT Malabe — built to keep
            student accommodation simple, secure, and seamlessly connected.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: "3", label: "Hostel Blocks", icon: "🏢" },
              { num: "24/7", label: "Security Support", icon: "🛡️" },
              { num: "Wi-Fi", label: "Connected Living", icon: "📶" },
              { num: "100%", label: "Student Focused", icon: "🎓" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 hover:-translate-y-1 transition-all duration-200 animate-[fadeUp_0.5s_ease_both]"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl md:text-2xl font-black">{s.num}</div>
                <div className="text-xs text-white/70 font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute w-80 h-80 rounded-full bg-white/5 -top-24 -right-20 pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full bg-white/5 -bottom-20 left-1/3 pointer-events-none" />
        <div className="absolute w-32 h-32 rounded-full bg-white/5 top-8 -left-10 pointer-events-none" />
      </section>

      {/* ── Blocks ── */}
      <section className="bg-white border border-blue-100/60 rounded-2xl p-6 md:p-8 lg:p-10 shadow-md shadow-blue-100/50 mb-6">
        <div className="mb-7">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold tracking-wider uppercase rounded-full px-3 py-1.5 mb-2">
            Accommodation
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Our Hostel Blocks</h2>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">Three dedicated blocks designed for comfort, safety, and academic focus.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { letter:"A", title:"Block A — Boys",   desc:"Secure, comfortable residence for male students with study-friendly common areas and round-the-clock supervision.", color:"#1D4ED8", bg:"rgba(29,78,216,0.07)",  bdr:"rgba(29,78,216,0.18)" },
            { letter:"B", title:"Block B — Girls",  desc:"Safe and well-managed residence for female students with enhanced security, privacy, and dedicated wardens.",      color:"#7C3AED", bg:"rgba(124,58,237,0.07)", bdr:"rgba(124,58,237,0.18)" },
            { letter:"C", title:"Block C — Faculty",desc:"Private, peaceful accommodation for lecturers and instructors, separate from student blocks with premium amenities.",color:"#0891B2", bg:"rgba(8,145,178,0.07)",  bdr:"rgba(8,145,178,0.18)" },
          ].map((b, i) => (
            <div
              key={b.letter}
              className="rounded-xl p-6 relative overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl"
              style={{ backgroundColor: b.bg, border: `1.5px solid ${b.bdr}` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mb-4"
                style={{ backgroundColor: b.bg, color: b.color, border: `1.5px solid ${b.bdr}` }}
              >
                {b.letter}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">{b.title}</h3>
              <p className="text-xs text-slate-600/80 leading-relaxed">{b.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 opacity-60 rounded-b-xl" style={{ backgroundColor: b.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/50 rounded-2xl p-6 md:p-8 lg:p-10 shadow-md mb-6">
        <div className="mb-7">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold tracking-wider uppercase rounded-full px-3 py-1.5 mb-2">
            Platform
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">What You Can Do</h2>
          <p className="text-sm text-slate-500 mt-1">Everything a student needs, in one streamlined place.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon:"🛏️", title:"Room Selection",   desc:"Browse available rooms by block and book your preferred space with ease." },
            { icon:"📋", title:"Leave Requests",    desc:"Submit and track leave requests digitally — no paperwork, no queues." },
            { icon:"🔔", title:"Notifications",     desc:"Stay updated with hostel announcements and important alerts in real time." },
            { icon:"🖼️", title:"Gallery",           desc:"Explore photos of all blocks, rooms, and facilities before you move in." },
            { icon:"👤", title:"Student Profile",   desc:"Manage your personal details and hostel information from one dashboard." },
            { icon:"🔒", title:"Secure Access",     desc:"JWT-authenticated access ensures your data is always private and safe." },
          ].map((f, i) => (
            <div
              key={f.title}
              className="bg-white border border-blue-100 rounded-xl p-5 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1.5">{f.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Facilities ── */}
      <section className="bg-white border border-blue-100/60 rounded-2xl p-6 md:p-8 lg:p-10 shadow-md mb-6">
        <div className="mb-6">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold tracking-wider uppercase rounded-full px-3 py-1.5 mb-2">
            Facilities
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Life at the Hostel</h2>
          <p className="text-sm text-slate-500 mt-1">Everything designed to support comfortable student life and academic success.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[
            "Free Wi-Fi","24-Hour Security","Clean Water & Electricity",
            "Study-Friendly Environment","Common Areas","Laundry Support",
            "Maintenance Requests","Hostel Announcements","CCTV Surveillance","Emergency Support",
          ].map((x, i) => (
            <span
              key={x}
              className="bg-blue-50/80 border border-blue-200/70 text-blue-700 text-xs md:text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              {x}
            </span>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-white border border-blue-100/60 rounded-2xl p-6 md:p-8 lg:p-10 shadow-md mb-6 grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
        <div>
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold tracking-wider uppercase rounded-full px-3 py-1.5 mb-2">
            Our Mission
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">Why UniStay Exists</h2>
          <p className="text-sm text-slate-600 leading-relaxed my-4">
            Our mission is to provide a <strong>safe, comfortable, and technology-enabled</strong> hostel
            experience for every SLIIT student and staff member. UniStay replaces manual
            processes with a smart, connected system that keeps everyone informed.
          </p>
          <div className="space-y-2.5">
            {[
              "Simple and transparent room selection process",
              "Faster communication through real-time notifications",
              "Paperless leave request handling and tracking",
            ].map((m, i) => (
              <div key={m} className="flex items-start gap-3 bg-blue-50/40 border border-blue-100/70 rounded-xl p-3 text-sm font-semibold text-slate-700">
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100/60 text-blue-700 font-black text-xs rounded-lg">✓</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black">U</div>
              <div>
                <div className="font-black text-base">SLIIT UniStay</div>
                <div className="text-xs opacity-70">Official Hostel System</div>
              </div>
            </div>
            <div className="h-px bg-white/20 mb-4" />
            {[
              { label:"System Type",  val:"Web Application" },
              { label:"Institution",  val:"SLIIT Malabe" },
              { label:"Access",       val:"Student & Staff" },
              { label:"Support",      val:"24 / 7 Available" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-white/10 text-sm">
                <span className="text-white/60 font-semibold">{r.label}</span>
                <span className="text-white font-bold">{r.val}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-4 flex-wrap">
              {["Secure", "Modern", "Simple"].map((p) => (
                <span key={p} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 border border-white/20">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="bg-white border border-blue-100/60 rounded-2xl p-6 md:p-8 lg:p-10 shadow-md">
        <div className="mb-6">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold tracking-wider uppercase rounded-full px-3 py-1.5 mb-2">
            Contact
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Location & Support</h2>
          <p className="text-sm text-slate-500 mt-1">Reach out for any hostel-related queries or assistance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            { icon:"📍", label:"Location", val:"SLIIT Malabe, New Kandy Road, Malabe, Sri Lanka" },
            { icon:"📧", label:"Email",    val:"unistay@sliit.lk" },
            { icon:"📞", label:"Phone",    val:"+94 11 754 4801" },
            { icon:"🕐", label:"Hours",    val:"24/7 Security  •  Office: 8:30 AM – 4:30 PM" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3 p-4 bg-blue-50/40 border border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 flex items-center justify-center bg-blue-100/60 rounded-xl text-xl">{c.icon}</div>
              <div>
                <div className="text-[11px] font-extrabold tracking-wide uppercase text-slate-400 mb-1">{c.label}</div>
                <div className="text-sm font-bold text-slate-800">{c.val}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
          <strong>Note:</strong> This platform is purpose-built for SLIIT hostel services — covering
          Room Selection, Leave Requests, Notifications, and Gallery access. For urgent matters,
          contact the hostel office directly.
        </div>
      </section>
    </div>
  );
}