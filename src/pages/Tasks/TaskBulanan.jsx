import React, { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getCategories,
  getUsers, // 🆕 dipakai admin untuk pilih task ini mau dikasih ke user mana
  // 🔧 getPeriods dihapus dari import — tidak dipakai lagi di halaman ini,
  // karena backend sekarang sudah kirim task ter-grouping per period_id.
} from "../../api/api";

// 🆕 Baca data user yang login dari localStorage (diisi saat login, lihat LoginPage.jsx)
// Sanctum token TIDAK menyimpan role (beda dengan JWT), jadi role harus dibaca dari sini,
// bukan dari token-nya sendiri. Pastikan response AuthController@login menyertakan `user.role`.
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

// Backend balikin data ter-group per period_id di response GET /api/tasks:
// { success, message, data: { "1": [...daily], "2": [...weekly], "3": [...monthly] } }
// Urutan sudah pasti: 1 = daily, 2 = weekly, 3 = monthly.
const PERIOD_ID = "3"; // monthly

const URGENCY_OPTIONS = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "critical", label: "Kritis" },
];

const urgencyStyle = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-600",
  critical: "bg-red-100 text-red-700",
};

// ==================== HELPER ====================
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = String(str).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmt = (date, opt) => new Intl.DateTimeFormat("id-ID", opt).format(date);

const normalizeTask = (t) => ({
  id: t.id,
  nama: t.name ?? "",
  urgency: t.level_of_urgency ?? "medium",
  categoryId: t.category_id ?? "",
  category: t.category?.name ?? "-",
  periodId: t.period_id ?? "",
  period: t.period?.name ?? "",
  userId: t.user_id ?? "",
  dueDateRaw: String(t.due_date ?? "").slice(0, 10),
  done: Boolean(t.is_completed),
});

const getGroupKey = (dateStr, groupBy) => {
  const d = parseDate(dateStr);
  if (!d) return { key: "none", label: "Tanpa tenggat", sort: 0 };

  if (groupBy === "harian") {
    return {
      key: dateStr,
      sort: d.getTime(),
      label: fmt(d, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }

  if (groupBy === "mingguan") {
    const start = new Date(d);
    start.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // awal minggu = Senin
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      key: start.getTime(),
      sort: start.getTime(),
      label: `${fmt(start, { day: "numeric", month: "long" })} – ${fmt(end, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
    };
  }

  // bulanan
  return {
    key: `${d.getFullYear()}-${d.getMonth()}`,
    sort: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
    label: fmt(d, { month: "long", year: "numeric" }),
  };
};

const getErrorMessage = (err) =>
  err.response?.data?.message || "Terjadi kesalahan, coba lagi.";

// ==================== ICON ====================
function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <path
        d="M16.5 4.5a1.9 1.9 0 0 1 2.7 2.7L8.5 17.9l-3.7.9.9-3.7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <path
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-6 w-6"
    >
      <path
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.58 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ==================== MODAL: TAMBAH / EDIT TASK ====================
// 🆕 tambah userId (khusus admin) & isCompleted
const emptyForm = {
  nama: "",
  urgency: "medium",
  categoryId: "",
  dueDateRaw: "",
  userId: "",
  isCompleted: false,
};

// 🆕 props baru: isAdmin, users
function TaskModal({
  task,
  categories,
  users,
  isAdmin,
  saving,
  onClose,
  onSubmit,
}) {
  // Saat modal dibuka untuk edit, form langsung terisi data task yang dipilih
  const [form, setForm] = useState(
    task
      ? {
          nama: task.nama,
          urgency: task.urgency,
          categoryId: task.categoryId,
          dueDateRaw: task.dueDateRaw,
          userId: task.userId ?? "", // 🆕
          isCompleted: task.done, // 🆕
        }
      : emptyForm,
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value }); // 🆕 dukung checkbox
  };

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          {task ? "Edit Task" : "Tambah Task"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Nama task
            </label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className={inputClass}
              autoFocus
            />
          </div>

          {/* 🆕 Field ini hanya muncul kalau yang login admin. Member tidak perlu pilih
              user_id karena backend sudah isi otomatis lewat prepareForValidation. */}
          {isAdmin && (
            <div>
              <label className="mb-1 block text-sm text-slate-500">
                Ditugaskan untuk
              </label>
              <select
                name="userId"
                value={form.userId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Tingkat urgensi
            </label>
            <select
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
              className={inputClass}
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Kategori
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {/* 🆕 Pesan bantu kalau dropdown kategori kosong — biasanya karena akses ditolak backend (403) */}
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                Daftar kategori belum tersedia. Minta admin membuka akses baca
                kategori untuk member, atau pastikan sudah ada data kategori.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">Tenggat</label>
            <input
              type="date"
              name="dueDateRaw"
              value={form.dueDateRaw}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* 🆕 Kolom selesai / tidak, langsung dari form create & edit */}
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="isCompleted"
              checked={form.isCompleted}
              onChange={handleChange}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            Tandai sudah selesai
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={saving || !form.nama || !form.dueDateRaw}
            onClick={() => onSubmit(form)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL: KONFIRMASI HAPUS ====================
function DeleteModal({ task, deleting, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertIcon />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Hapus task ini?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Task{" "}
              <span className="font-medium text-slate-700">"{task.nama}"</span>{" "}
              akan dihapus secara permanen dan tidak bisa dikembalikan.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PAGE ====================
export default function TaskBulanan() {
  const [tasksData, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]); // 🆕 daftar user, cuma diisi kalau admin
  const [groupBy, setGroupBy] = useState("bulanan");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({ open: false, task: null });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🔧 Tidak perlu lagi cari period_id dari daftar periods — tinggal pakai PERIOD_ID di atas.

  // 🆕 Role dibaca dari localStorage (hasil login), BUKAN dari token —
  // Sanctum token cuma string random, tidak menyimpan data apa pun.
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // 🆕 Daftar user cuma perlu diambil kalau yang login admin (endpoint /api/users memang admin-only)
  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const res = await getUsers();
      setUsers(res.data?.data ?? res.data ?? []);
    } catch {
      setUsers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.data ?? res.data ?? []);
    } catch {
      // route categories hanya untuk admin & member; kalau tetap gagal, kosongkan saja
      setCategories([]);
    }
  };

  // 🔧 Disesuaikan dengan response baru: data adalah OBJECT { "1": [...], "2": [...], "3": [...] },
  // bukan array datar lagi. Kita ambil langsung key PERIOD_ID ("1" = daily).
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getTasks();
      const grouped = res.data?.data ?? {}; // { "1": [...], "2": [...], "3": [...] }
      const list = grouped[PERIOD_ID] ?? []; // key "3" = task monthly
      setTasks(list.map(normalizeTask));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchUsers(); // 🆕
    // 🔧 fetchPeriods() dihapus — tidak dipakai lagi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔧 Tidak perlu filter manual lagi — tasksData dari fetchTasks() sudah pasti
  // isinya cuma task period monthly, karena sudah diambil dari key PERIOD_ID.

  // Kelompokkan task sesuai pilihan groupBy (Hari / Minggu / Bulan tampilan tabel)
  const groups = useMemo(() => {
    const map = new Map();
    [...tasksData]
      .sort((a, b) => a.dueDateRaw.localeCompare(b.dueDateRaw))
      .forEach((task) => {
        const g = getGroupKey(task.dueDateRaw, groupBy);
        if (!map.has(g.key))
          map.set(g.key, { label: g.label, sort: g.sort, items: [] });
        map.get(g.key).items.push(task);
      });
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [tasksData, groupBy]);

  // ---------- Toggle selesai ----------
  const handleTaskDone = async (task) => {
    const newDone = !task.done;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: newDone } : t)),
    );
    try {
      await updateTask(task.id, { is_completed: newDone });
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)),
      );
      alert(getErrorMessage(err));
    }
  };

  // ---------- Simpan (tambah / edit) ----------
  const handleSubmit = async (form) => {
    const payload = {
      name: form.nama,
      level_of_urgency: form.urgency,
      category_id: form.categoryId || null,
      due_date: form.dueDateRaw,
      // Langsung pakai PERIOD_ID (period monthly) untuk task baru,
      // atau pertahankan period_id task lama kalau sedang edit.
      period_id: modal.task ? modal.task.periodId : Number(PERIOD_ID),
      is_completed: form.isCompleted, // 🆕 kirim status selesai dari form
    };

    // 🆕 Mode 1 (admin): sertakan user_id kalau admin memilih user tertentu.
    // Mode 2 (member): user_id TIDAK dikirim sama sekali, biar backend yang isi
    // otomatis lewat prepareForValidation (sesuai yang sudah kamu urus).
    if (isAdmin && form.userId) {
      payload.user_id = form.userId;
    }

    try {
      setSaving(true);
      if (modal.task) {
        await updateTask(modal.task.id, payload);
      } else {
        await createTask(payload);
      }
      setModal({ open: false, task: null });
      fetchTasks();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ---------- Hapus ----------
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  let rowNumber = 0;

  return (
    <div className="px-8 py-6">
      {/* Baris atas */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white">
            Tipe: Bulanan
          </span>

          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="groupBy" className="text-slate-500">
              Tampilkan per
            </label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="harian">Hari</option>
              <option value="mingguan">Minggu</option>
              <option value="bulanan">Bulan</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModal({ open: true, task: null })}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
        >
          <PlusIcon />
          Tambah Task
        </button>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-slate-500">
              <th className="px-6 py-3 font-medium">No</th>
              <th className="px-6 py-3 font-medium">Nama task</th>
              <th className="px-6 py-3 font-medium">Urgensi</th>
              <th className="px-6 py-3 font-medium">Kategori</th>
              <th className="px-6 py-3 font-medium">Tenggat</th>
              <th className="px-6 py-3 font-medium">Selesai</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-rose-500"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && groups.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  Belum ada task bulanan.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              groups.map((group) => (
                <React.Fragment key={group.label}>
                  <tr className="bg-stone-50/70">
                    <td colSpan={7} className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-1 rounded-full bg-amber-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          {group.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({group.items.length} task)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {group.items.map((task) => {
                    rowNumber += 1;
                    const due = parseDate(task.dueDateRaw);
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60"
                      >
                        <td className="px-6 py-3.5 text-slate-500">
                          {rowNumber}
                        </td>
                        <td
                          className={`px-6 py-3.5 font-medium ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}
                        >
                          {task.nama}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${urgencyStyle[task.urgency] ?? ""}`}
                          >
                            {URGENCY_OPTIONS.find(
                              (u) => u.value === task.urgency,
                            )?.label ?? task.urgency}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {task.category}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {due
                            ? fmt(due, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                          {due && (
                            <span className="ml-1 text-xs text-slate-400">
                              ({fmt(due, { weekday: "long" })})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleTaskDone(task)}
                            aria-pressed={task.done}
                            aria-label={
                              task.done
                                ? "Tandai belum selesai"
                                : "Tandai selesai"
                            }
                            className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                              task.done
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-stone-300 bg-white hover:border-emerald-400"
                            }`}
                          >
                            {task.done && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="h-3 w-3"
                              >
                                <path
                                  d="M5 12.5l4.5 4.5L19 7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Edit task"
                              onClick={() => setModal({ open: true, task })}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              title="Hapus task"
                              onClick={() => setDeleteTarget(task)}
                              className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <TaskModal
          task={modal.task}
          categories={categories}
          users={users} // 🆕
          isAdmin={isAdmin} // 🆕
          saving={saving}
          onClose={() => setModal({ open: false, task: null })}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          task={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
