import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreDashboard from './pages/StoreDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProcedureDashboard from './pages/ProcedureDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<StoreDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/procedures" element={<ProcedureDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
