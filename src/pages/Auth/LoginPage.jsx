import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, setToken } from "../../api/api"; // 🆕 import fungsi login & setToken dari api.js

export default function LoginPage() {
  const navigate = useNavigate();

  // 🆕 State untuk input form (sebelumnya pakai defaultValue statis, sekarang dikontrol via state)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // 🆕 State untuk status request: loading saat submit, error kalau login gagal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🆕 handleSubmit sekarang async dan benar-benar memanggil API, bukan langsung navigate
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🆕 Panggil endpoint POST /api/login lewat api.js
      const res = await login({ email, password });

      // ⚠️ Sesuaikan `res.data.token` & `res.data.user` dengan bentuk response
      // AuthController@login kamu. Contoh umum Sanctum: { token, user }
      const token = res.data.token ?? res.data.access_token;
      const user = res.data.user;

      if (!token) {
        throw new Error("Token tidak ditemukan pada response login.");
      }

      // 🆕 Simpan token supaya otomatis disisipkan interceptor api.js di request berikutnya
      setToken(token);

      // 🆕 Simpan data user (role dsb) untuk dipakai di halaman lain, misal cek role admin/member
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // 🆕 "Ingat saya" hanya menentukan penyimpanan dipertahankan atau tidak.
      // Karena token disimpan di localStorage (bukan sessionStorage), token akan
      // tetap ada walau tab ditutup. Kalau mau "Ingat saya" benar-benar berefek,
      // ganti ke sessionStorage saat rememberMe === false (opsional, sesuaikan kebutuhan).

      navigate("/dashboard/taskHarian");
    } catch (err) {
      // 🆕 Tampilkan pesan error dari backend (mis. "Email atau password salah")
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal masuk. Periksa kembali email dan kata sandi kamu.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Panel kiri: brand */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 px-12 py-10 lg:flex">
        <div className="flex items-center gap-2.5">
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
          <span className="text-base font-bold text-white">MyTask</span>
        </div>

        <div className="max-w-sm">
          <h2 className="text-3xl font-bold leading-snug text-white">
            Catat, atur, dan selesaikan tugasmu tanpa terlewat satu pun.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Pisahkan task harian, mingguan, dan bulanan dalam satu tempat, lalu
            pantau semuanya sesuai periode yang kamu mau.
          </p>
        </div>

        {/* Kartu dekoratif ala preview task */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-xs text-slate-400">Hari ini</p>
          <div className="mt-3 space-y-2.5">
            {[
              { label: "Review desain landing page", done: false },
              { label: "Belanja bulanan", done: true },
              { label: "Olahraga pagi", done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                    item.done
                      ? "border-amber-400 bg-amber-400"
                      : "border-slate-600"
                  }`}
                >
                  {item.done && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="3"
                      className="h-2.5 w-2.5"
                    >
                      <path
                        d="M5 12.5l4.5 4.5L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm ${item.done ? "text-slate-500 line-through" : "text-slate-200"}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel kanan: form login */}
      <div className="flex items-center justify-center bg-stone-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo untuk mobile, panel kiri disembunyikan di layar kecil */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
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
            <span className="text-base font-bold text-slate-900">MyTask</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Masuk ke akunmu
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Lanjutkan mengatur task harian, mingguan, dan bulananmu.
          </p>

          {/* 🆕 Banner error, muncul kalau login gagal */}
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email} // 🆕 sebelumnya defaultValue="dimas@mytask.app", sekarang controlled input
                onChange={(e) => setEmail(e.target.value)} // 🆕
                required // 🆕
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Kata sandi
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Masukkan kata sandi"
                value={password} // 🆕 sebelumnya defaultValue="••••••••", sekarang controlled input
                onChange={(e) => setPassword(e.target.value)} // 🆕
                required // 🆕
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe} // 🆕 sebelumnya defaultChecked, sekarang controlled
                onChange={(e) => setRememberMe(e.target.checked)} // 🆕
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              Ingat saya di perangkat ini
            </label>

            <button
              type="submit"
              disabled={loading} // 🆕 tombol nonaktif & teks berubah saat request berjalan
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"} {/* 🆕 */}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <a
              href="#"
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              Daftar sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
