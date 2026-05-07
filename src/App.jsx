import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- COMPONENT IMPORTS ---
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import HRDashboard from './pages/HRDashboard';
import AdminDashboard from './pages/AdminDashboard'; 

export default function App() {
  const [view, setView] = useState('auth');
  const [loading, setLoading] = useState(true);

  // ---SESSION PERSISTENCE LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (token && userInfo) {
      if (userInfo.role === 'admin') setView('admin-dashboard');
      else if (userInfo.role === 'hr') setView('hr-dashboard');
      else setView('student-dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setView('auth');
  };

  if (loading) return null;

  const renderView = () => {
    switch(view) {
      case 'auth': 
        return <AuthPage setView={setView} />;
      
      case 'student-dashboard': 
        return <StudentDashboard setView={setView} logout={handleLogout} />;
      
      case 'hr-dashboard': 
        return <HRDashboard setView={setView} logout={handleLogout} />;
      
      case 'admin-dashboard': 
        return <AdminDashboard setView={setView} logout={handleLogout} />;
      
      default: 
        return <AuthPage setView={setView} />;
    }
  };

  return (
    <div className="antialiased text-slate-900 bg-[#f4f7fc] min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full min-h-screen"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}