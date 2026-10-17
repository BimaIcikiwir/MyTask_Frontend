import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL;

// KLIEN AXIOS DENGAN KONFIGURASI DEFAULT
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ==================== TOKEN HELPER ====================
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// 🆕 USER HELPER — dipakai di Header.jsx, TaskHarian.jsx, dll.
// Data user (termasuk role) disimpan saat login (lihat LoginPage.jsx),
// karena Sanctum token sendiri tidak menyimpan data apa pun.
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};
export const setCurrentUser = (user) =>
  localStorage.setItem("user", JSON.stringify(user));
export const removeCurrentUser = () => localStorage.removeItem("user");

// ==================== INTERCEPTOR ====================
// Otomatis menyisipkan Bearer token (Sanctum) di setiap request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Jika token tidak valid / expired (401), hapus token & arahkan ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      removeCurrentUser(); // 🆕 pakai helper, sebelumnya localStorage.removeItem("user") langsung
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ==================== AUTH (tanpa token) ====================
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);

// ==================== USERS ====================
// admin: index, store, destroy | admin & member: update
export const getUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ==================== CATEGORIES (admin) ====================
export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ==================== PERIODS (admin) ====================
export const getPeriods = () => api.get("/periods");
export const createPeriod = (data) => api.post("/periods", data);
export const updatePeriod = (id, data) => api.put(`/periods/${id}`, data);
export const deletePeriod = (id) => api.delete(`/periods/${id}`);

// ==================== TASKS (admin & member) ====================
export const getTasks = () => api.get("/tasks");
export const createTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;
