import { Building2, LayoutGrid, ListChecks, PlusCircle, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const studentTabs = [
  { label: "Dashboard", path: "/complaint-dashboard", icon: LayoutGrid },
  { label: "New Complaint", path: "/new-complaint", icon: PlusCircle },
  { label: "My Complaints", path: "/complaints", icon: ListChecks },
];

function isActive(pathname, path) {
  if (path === "/complaints") {
    return pathname === path || pathname.startsWith("/complaint-details/");
  }
  return pathname === path;
}

export default function NaveBar() {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/complaint-admin";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          <Link to={isAdmin ? "/complaint-admin" : "/complaint-dashboard"} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[1.7rem] font-bold leading-none text-slate-900">HostalZone</p>
              <p className="mt-1 text-xs text-slate-500">Complaint Management System</p>
            </div>
          </Link>

          <div
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold ${
              isAdmin
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-700"
            }`}
          >
            {isAdmin ? <ShieldCheck size={16} /> : <UserRound size={16} />}
            {isAdmin ? "Admin Portal" : "Student Portal"}
          </div>
        </div>

        {!isAdmin ? (
          <nav className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 py-3">
            {studentTabs.map(({ label, path, icon: Icon }) => {
              const active = isActive(pathname, path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="flex items-center gap-2 border-t border-slate-200/80 py-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
              <LayoutGrid size={16} />
              Manage Complaints
            </span>
          </nav>
        )}
      </div>
    </header>
  );
}
