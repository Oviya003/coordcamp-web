import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';
import { WifiOff } from 'lucide-react';
import ChatWindow from '../chatbot/ChatWindow';

export default function DashboardLayout() {
  const { token } = useAuthStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-cc-offwhite">
      <Navbar />
      {isOffline && (
        <div className="bg-red-500 text-white font-bold py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff size={18} /> You are currently offline. Some features may be unavailable.
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 bg-cc-cream rounded-tl-3xl shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] overflow-y-auto h-[calc(100vh-80px)]">
          <Outlet />
        </main>
      </div>
      
      {/* Global Chatbot Widget */}
      <ChatWindow />
    </div>
  );
}