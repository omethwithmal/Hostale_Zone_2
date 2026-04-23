import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";

const links = [
  { to: "/complaint-home", label: "Home" },
  { to: "/complaint-dashboard", label: "Dashboard" },
  { to: "/complaints", label: "Complaints" },
  { to: "/new-complaint", label: "Raise Complaint" },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-200"
      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
  }`;

export default function NaveBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="mt-4 w-full px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_18px_60px_-24px_rgba(37,99,235,0.55)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/complaint-home" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-200">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight text-slate-900">
                  HostalZone
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Complaint &amp; Maintenance Suite
                </p>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-2 md:flex">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="inline-flex rounded-2xl border border-slate-200 p-2 text-slate-700 md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {open && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 md:hidden">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}