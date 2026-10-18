import React from "react";
import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const navItems = [
  {
    to: "/dashboard/taskHarian",
    label: "Harian",
    description: "Agenda hari ini",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/dashboard/taskMingguan",
    label: "Mingguan",
    description: "Rencana minggu ini",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        <path d="M7.5 15h9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/dashboard/taskBulanan",
    label: "Bulanan",
    description: "Target bulan ini",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        <path
          d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17h2M11 17h2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function Sidebar() {
  return (
    <aside className="flex h-full flex-col justify-between bg-slate-900 px-6 py-8">
      <div>
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                d="M5 12.5l4.5 4.5L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold leading-none text-white">
              MyTask
            </p>
            <p className="mt-1 text-xs text-slate-400">Catatan tugasmu</p>
          </div>
        </div>

        {/* Navigasi tipe task */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl border-l-2 px-3.5 py-3 transition-colors ${
                  isActive
                    ? "border-amber-400 bg-white/5 text-white"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      isActive
                        ? "text-amber-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }
                  >
                    {item.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {item.description}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {/* Ringkasan singkat */}
        <div className="rounded-xl bg-white/5 px-4 py-4">
          <p className="text-xs text-slate-400">Tugas selesai bulan ini</p>
          <p className="mt-1 text-2xl font-bold text-white">
            18<span className="text-sm font-medium text-slate-500">/24</span>
          </p>
        </div>

        {/* TOMBOL LOGOUT */}
        <LogoutButton />
      </div>
    </aside>
  );
}

export default Sidebar;
