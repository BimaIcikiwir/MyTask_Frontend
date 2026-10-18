import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// Satu layout untuk semua ukuran layar (breakpoint utama: lg = 1024px)
// - Mobile & tablet (< lg): sidebar jadi drawer yang dibuka lewat tombol menu di header
// - Desktop (>= lg): sidebar tampil tetap di kiri (sticky), seperti sebelumnya
function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = () => setSidebarOpen(false);

    // Tutup drawer dengan tombol Esc
    useEffect(() => {
        if (!sidebarOpen) return;
        const onKeyDown = (e) => e.key === "Escape" && setSidebarOpen(false);
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [sidebarOpen]);

    return (
        <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
            {/* Overlay gelap di belakang drawer (hanya mobile/tablet) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar: drawer di layar kecil, sticky di layar besar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 transition-[transform,visibility] duration-200 ease-out lg:visible lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-screen lg:translate-x-0 ${
                    sidebarOpen
                        ? "visible translate-x-0"
                        : "invisible -translate-x-full"
                }`}
            >
                <Sidebar onNavigate={closeSidebar} onClose={closeSidebar} />
            </div>

            {/* min-w-0 supaya konten lebar (tabel) tidak mendorong layout keluar layar */}
            <main className="flex min-w-0 flex-col">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
