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

function Header() {
  // 🆕 sebelumnya: const user = { name: "Dimas Aditya", initials: "DA" } (dummy/statis)
  // sekarang: ambil dari localStorage hasil login
  const user = getCurrentUser();
  const name = user?.name || "Pengguna"; // 🆕 fallback kalau data user belum ada
  const initials = getInitials(name); // 🆕 dihitung otomatis dari nama, tidak lagi hardcode "DA"

  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-slate-100 px-8 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Selamat datang, {name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{today}</p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
        {initials}
      </div>
    </header>
  );
}

export default Header;
