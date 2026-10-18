import React from "react";
import { getCurrentUser } from "../api/api"; // 🆕 ambil data user yang sedang login

// 🆕 Bikin inisial dari nama, contoh: "Dimas Aditya" -> "DA", "Budi" -> "B"
function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

const today = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Header({ onMenuClick }) {
  // 🆕 sebelumnya: const user = { name: "Dimas Aditya", initials: "DA" } (dummy/statis)
  // sekarang: ambil dari localStorage hasil login
  const user = getCurrentUser();
  const name = user?.name || "Pengguna"; // 🆕 fallback kalau data user belum ada
  const initials = getInitials(name); // 🆕 dihitung otomatis dari nama, tidak lagi hardcode "DA"

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-slate-100 px-4 py-3.5 sm:px-6 lg:px-8 lg:py-6">
      {/* Tombol menu: hanya muncul di mobile/tablet, untuk membuka sidebar */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Buka menu"
        className="-ml-1.5 shrink-0 rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-200 lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
          Selamat datang, {name}
        </h1>
        <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm lg:mt-1">
          {today}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white lg:h-11 lg:w-11">
        {initials}
      </div>
    </header>
  );
}

export default Header;
