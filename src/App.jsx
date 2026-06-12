import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Dashboard from './pages/user/Dashboard';
import Matches from './pages/user/Matches';
import Leaderboard from './pages/user/Leaderboard';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManageMatches from './pages/admin/ManageMatches';
import AddMatch from './pages/admin/AddMatch';
import UserPredictions from './pages/admin/UserPredictions';
import AdminLeaderboard from './pages/admin/Leaderboard';
import PendingUsers from './pages/admin/PendingUsers';

const ProtectedUserRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public User Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route path="/" element={<ProtectedUserRoute><UserLayout /></ProtectedUserRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="matches" element={<Matches />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Public Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="matches" element={<ManageMatches />} />
          <Route path="add-match" element={<AddMatch />} />
          <Route path="predictions" element={<UserPredictions />} />
          <Route path="pending" element={<PendingUsers />} />
          <Route path="leaderboard" element={<AdminLeaderboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
