import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BaseLayout } from './components/layout/BaseLayout';
import { Login } from './pages/Login';
import { Map } from './pages/Map';
import { Analytics } from './pages/Analytics';
import { Sources } from './pages/Sources';
import { Settings } from './pages/Settings';
import { Landing } from './pages/Landing';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/app" element={<ProtectedRoute><BaseLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/map" replace />} />
        <Route path="map" element={<Map />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="sources" element={<Sources />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer theme="dark" position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
