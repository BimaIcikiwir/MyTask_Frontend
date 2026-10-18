import React, { useState } from "react";

// Dummy data task harian
const tasks = [
  {
    id: 1,
    nama: "Review desain landing page",
    urgency: "Tinggi",
    category: "Kerja",
    dueDate: "8 Sep 2026",
    dueDay: "Selasa",
    done: false,
  },
  {
    id: 2,
    nama: "Belanja bulanan",
    urgency: "Sedang",
    category: "Pribadi",
    dueDate: "8 Sep 2026",
    dueDay: "Selasa",
    done: false,
  },
  {
    id: 3,
    nama: "Baca 20 halaman buku",
    urgency: "Rendah",
    category: "Pribadi",
    dueDate: "9 Sep 2026",
    dueDay: "Rabu",
    done: true,
  },
  {
    id: 4,
    nama: "Kirim invoice ke klien",
    urgency: "Tinggi",
    category: "Kerja",
    dueDate: "10 Sep 2026",
    dueDay: "Kamis",
    done: false,
  },
  {
    id: 5,
    nama: "Olahraga pagi",
    urgency: "Sedang",
    category: "Kesehatan",
    dueDate: "11 Sep 2026",
    dueDay: "Jumat",
    done: true,
  },
  {
    id: 6,
    nama: "Kerjakan tugas kalkulus",
    urgency: "Tinggi",
    category: "Kuliah",
    dueDate: "14 Sep 2026",
    dueDay: "Senin",
    done: false,
  },
  {
    id: 7,
    nama: "Rapat mingguan tim",
    urgency: "Sedang",
    category: "Kerja",
    dueDate: "15 Sep 2026",
    dueDay: "Selasa",
    done: false,
  },
];

// Contoh hasil groupBy = "Minggu": task harian dikelompokkan per rentang minggu,
// tanpa mencampur task bertipe mingguan/bulanan.

const urgencyStyle = {
  Tinggi: "bg-rose-50 text-rose-600",
  Sedang: "bg-amber-50 text-amber-700",
  Rendah: "bg-emerald-50 text-emerald-700",
};

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

export default function TaskMingguan() {
  let rowNumber = 0;

  const [tasksData, setTasks] = useState(tasks);

  // TAMPILAN GROUP MANUAL MINGGUAN
  const group_weeks = [
    { label: "8 – 14 September 2026", items: tasksData.slice(0, 6) },
    { label: "15 – 21 September 2026", items: tasksData.slice(6) },
  ];

  // TAMPILAN GROUP MANUAL HARIAN
  const group_days = [
    {
      label: "Senin, 8 September 2026",
      items: tasksData.slice(0, 2),
    },
    {
      label: "Selasa, 9 September 2026",
      items: tasksData.slice(2, 3),
    },
    {
      label: "Rabu, 10 September 2026",
      items: tasksData.slice(3, 6),
    },
    {
      label: "Kamis, 11 September 2026",
      items: tasksData.slice(6, 7),
    },
  ];

  // TAMPILAN GROUP MANUAL TAHUNAN
  const group_months = [
    {
      label: "Januari 2026",
      items: tasksData.slice(0, 4),
    },
    {
      label: "Februari 2026",
      items: tasksData.slice(4, 6),
    },
    {
      label: "Maret 2026",
      items: tasksData.slice(6),
    },
  ];

  const handleTaskDone = (id) => {
    setTasks(tasksData.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

    console.log("Task berubah! pada id:", id, typeof id);
  };

  return (
    <div className="px-8 py-6">
      {/* Baris atas: tipe task + groupBy + tombol tambah */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white">
            Tipe: Mingguan
          </span>

          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="groupBy" className="text-slate-500">
              Tampilkan per
            </label>
            <select
              id="groupBy"
              defaultValue="mingguan"
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
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
        >
          <PlusIcon />
          Tambah Task
        </button>
      </div>

      {/* Tabel task, dikelompokkan sesuai groupBy */}
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
            {group_weeks.map((group) => (
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
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60"
                    >
                      <td className="px-6 py-3.5 text-slate-500">
                        {rowNumber}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {task.nama}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${urgencyStyle[task.urgency]}`}
                        >
                          {task.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {task.category}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {task.dueDate}
                        <span className="ml-1 text-xs text-slate-400">
                          ({task.dueDay})
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleTaskDone(task.id)}
                          aria-pressed={task.done}
                          aria-label={
                            task.done
                              ? "Tandai belum selesai"
                              : "Tandai selesai"
                          }
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors cursor-pointer ${
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
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            title="Hapus task"
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
    </div>
  );
}
