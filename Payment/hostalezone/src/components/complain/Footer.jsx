export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex w-full flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 2xl:px-10">
        <div>
          <p className="font-semibold text-slate-700">HostalZone Complaint Management</p>
          <p>Professional maintenance tracking for a smarter hostel experience.</p>
        </div>

        <p className="text-sm text-slate-500">
          Helping students report issues and monitor complaint resolution more effectively.
        </p>
      </div>
    </footer>
  );
}