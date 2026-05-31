import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import RoleGuard from './components/layout/RoleGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import ChatbotPage from './pages/shared/ChatbotPage';
import NotFound from './pages/shared/NotFound';
import Unauthorized from './pages/shared/Unauthorized';
import ResetPassword from './pages/auth/ResetPassword';
import SplashScreen from './components/SplashScreen';
import { useState } from 'react';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/student/Dashboard';
import Events from './pages/student/Events';
import EventDetail from './pages/student/EventDetail';
import QRCheckIn from './pages/student/QRCheckIn';
import Geofence from './pages/student/Geofence';
import Clubs from './pages/student/Clubs';
import ClubDetail from './pages/student/ClubDetail';
import Notifications from './pages/student/Notifications';
import LeaderDashboard from './pages/leader/LeaderDashboard';
import CreateEvent from './pages/leader/CreateEvent';
import LeaderEvents from './pages/leader/LeaderEvents';
import LeaderMembers from './pages/leader/LeaderMembers';
import LeaderAttendance from './pages/leader/LeaderAttendance';
import LeaderCredits from './pages/leader/LeaderCredits';
import LeaderAnnouncements from './pages/leader/LeaderAnnouncements';
import LeaderSettings from './pages/leader/LeaderSettings';
import CreateClub from './pages/leader/CreateClub';
import Analytics from './pages/leader/Analytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import Achievements from './pages/student/Achievements';
import Profile from './pages/Profile';

import AdminUsers from './pages/admin/AdminUsers';
import AdminClubs from './pages/admin/AdminClubs';
import AdminEvents from './pages/admin/AdminEvents';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import Credits from './pages/student/Credits';
import StudentSettings from './pages/student/StudentSettings';

function App() {
  const { initializeAuth } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeAuth();
    
    // Splash screen timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen />}
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Navigate to="/login/student" replace />} />
        <Route path="/register" element={<Navigate to="/register/student" replace />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* STUDENT ROUTES */}
        <Route path="/student" element={<RoleGuard allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="qr" element={<QRCheckIn />} />
            <Route path="geofence" element={<Geofence />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="clubs/:id" element={<ClubDetail />} />
            <Route path="credits" element={<Credits />} />
            <Route path="ai" element={<ChatbotPage />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* LEADER ROUTES */}
        <Route path="/leader" element={<RoleGuard allowedRoles={['clubLeader', 'leader', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<LeaderDashboard />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="create-club" element={<CreateClub />} />
            <Route path="analytics" element={<Analytics />} />
            
            {/* New Leader Sidebar Routes */}
            <Route path="events" element={<LeaderEvents />} />
            <Route path="members" element={<LeaderMembers />} />
            <Route path="attendance" element={<LeaderAttendance />} />
            <Route path="credits" element={<LeaderCredits />} />
            <Route path="announcements" element={<LeaderAnnouncements />} />
            <Route path="ai" element={<ChatbotPage />} />
            <Route path="settings" element={<LeaderSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* New Admin Sidebar Routes */}
            <Route path="users" element={<AdminUsers />} />
            <Route path="clubs" element={<AdminClubs />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="ai" element={<ChatbotPage />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;