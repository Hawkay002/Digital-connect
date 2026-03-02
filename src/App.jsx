import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home'; // 🌟 NEW: Imported the Home page
import Dashboard from './pages/Dashboard';
import CreateCard from './pages/CreateCard';
import EditCard from './pages/EditCard';
import PublicCard from './pages/PublicCard';
import Login from './pages/Login';
import Admin from './pages/Admin'; 

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { currentUser } = useAuth(); // 🌟 NEW: Check auth state for the root route

  return (
    <Routes>
      {/* If already logged in, redirect them to the Dashboard instead of showing Login */}
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      
      {/* 🌟 NEW: Show Dashboard if logged in, otherwise show the Home landing page */}
      <Route path="/" element={currentUser ? <Dashboard /> : <Home />} />
      
      <Route path="/create" element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
      <Route path="/edit/:profileId" element={<ProtectedRoute><EditCard /></ProtectedRoute>} />
      
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      
      <Route path="/id/:profileId" element={<PublicCard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
