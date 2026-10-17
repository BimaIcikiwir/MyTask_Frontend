import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TaskHarian from './pages/Tasks/TaskHarian';
import TaskBulanan from './pages/Tasks/TaskBulanan';
import TaskMingguan from './pages/Tasks/TaskMingguan';
import LoginPage from './pages/Auth/LoginPage';
import Layout from './layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROUTE LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* ROUTE MAIN CONTENT */}
        <Route path="/dashboard" element={<Layout />}>
          <Route path="taskHarian" element={<TaskHarian />} />
          <Route path="taskMingguan" element={<TaskMingguan />} />
          <Route path="taskBulanan" element={<TaskBulanan />} />
        </Route>

        {/* ROUTE DEFAULT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;