import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/api";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm";

function LogoMark({ className = "" }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 ${className}`}
    >
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
  );
}

function EyeIcon({ off }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path
        d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" strokeLinecap="round" />}
    </svg>
  );
}

// Field password dengan tombol tampilkan/sembunyikan
function PasswordField({ id, label, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
        >
          <EyeIcon off={show} />
        </button>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  // Daftar pesan error (bisa lebih dari satu, mis. dari validasi Laravel 422)
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    // Validasi singkat di sisi klien
    if (form.password.length < 8) {
      setErrors(["Kata sandi minimal 8 karakter."]);
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErrors(["Konfirmasi kata sandi tidak sama."]);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Berhasil -> ke halaman login dengan banner sukses
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      const validation = err.response?.data?.errors; // format 422 Laravel: { field: [pesan] }
      if (validation) {
        setErrors(Object.values(validation).flat());
      } else {
        setErrors([
          err.response?.data?.message ||
            err.message ||
            "Gagal mendaftar. Coba lagi beberapa saat.",
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Panel kiri: brand (hanya tampil di layar lg ke atas) */}
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 px-12 py-10 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />

        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-base font-bold text-white">MyTask</span>
        </div>

        <div className="max-w-sm">
          <h2 className="text-3xl font-bold leading-snug text-white">
            Mulai atur tugasmu dari hari ini.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Buat akun gratis dan kelola semua task dalam satu tempat, mulai dari
            yang harian sampai target bulanan.
          </p>
        </div>

        {/* Kartu poin keunggulan */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-xs text-slate-400">Yang kamu dapatkan</p>
          <div className="mt-3 space-y-2.5">
            {[
              "Task harian, mingguan, dan bulanan",
              "Atur tingkat urgensi dan kategori",
              "Pantau mana yang sudah selesai",
            ].map((label) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-md border border-amber-400 bg-amber-400">
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
                </span>
                <span className="text-sm text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel kanan: form daftar */}
      <div className="relative isolate flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute -left-16 -top-16 -z-10 h-64 w-64 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 -z-10 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl" />

        <div className="w-full max-w-sm rounded-3xl bg-white/80 p-6 shadow-xl shadow-amber-900/10 ring-1 ring-white backdrop-blur sm:p-8">
          {/* Logo untuk mobile, panel kiri disembunyikan di layar kecil */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <LogoMark />
            <span className="text-base font-bold text-slate-900">MyTask</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Buat akun baru
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Daftar dulu, lalu mulai catat task harian, mingguan, dan bulananmu.
          </p>

          {errors.length > 0 && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600"
            >
              {errors.length === 1 ? (
                errors[0]
              ) : (
                <ul className="list-disc space-y-0.5 pl-4">
                  {errors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Nama lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nama kamu"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Kata sandi"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={handleChange}
            />

            <PasswordField
              id="password_confirmation"
              name="password_confirmation"
              label="Konfirmasi kata sandi"
              placeholder="Ulangi kata sandi"
              value={form.password_confirmation}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
