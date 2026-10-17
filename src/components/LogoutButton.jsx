import { useNavigate } from "react-router-dom";

function DoorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path
        d="M13 4H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12h5m0 0-2.5-2.5M21 12l-2.5 2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    const confirmed = window.confirm("Yakin ingin keluar dari akunmu?");
    if (confirmed) {
      navigate("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Keluar"
      className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
    >
      <DoorIcon />
      <span className="text-sm font-medium">Keluar</span>
    </button>
  );
}
