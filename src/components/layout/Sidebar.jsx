import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, QrCode, MapPin, Users, Shield, PlusCircle, Database, BarChart2, Settings, Bot, CreditCard, FileText, CheckSquare, Bell, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <Home size={20} /> },
    { name: 'Events', path: '/student/events', icon: <Calendar size={20} /> },
    { name: 'Credits', path: '/student/credits', icon: <CreditCard size={20} /> },
    { name: 'Clubs', path: '/student/clubs', icon: <Users size={20} /> },
    { name: 'AI Assistant', path: '/student/ai', icon: <Bot size={20} /> },
    { name: 'Profile', path: '/student/settings', icon: <Users size={20} /> },
    { name: 'Notifications', path: '/student/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/student/settings', icon: <Settings size={20} /> },
  ];

  const leaderLinks = [
    { name: 'Dashboard', path: '/leader/dashboard', icon: <Home size={20} /> },
    { name: 'Create Club', path: '/leader/create-club', icon: <PlusCircle size={20} /> },
    { name: 'Events', path: '/leader/events', icon: <Calendar size={20} /> },
    { name: 'Members', path: '/leader/members', icon: <Users size={20} /> },
    { name: 'Attendance', path: '/leader/attendance', icon: <CheckSquare size={20} /> },
    { name: 'Credits', path: '/leader/credits', icon: <CreditCard size={20} /> },
    { name: 'Announcements', path: '/leader/announcements', icon: <Bell size={20} /> },
    { name: 'AI Assistant', path: '/leader/ai', icon: <Bot size={20} /> },
    { name: 'Settings', path: '/leader/settings', icon: <Settings size={20} /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <Home size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Clubs', path: '/admin/clubs', icon: <Shield size={20} /> },
    { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileText size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
    { name: 'AI Assistant', path: '/admin/ai', icon: <Bot size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const renderLinks = (links) => (
    <ul className="space-y-3">
      {links.map(link => {
        const isActive = location.pathname === link.path;
        return (
          <li key={link.name}>
            <Link onClick={onClose} to={link.path} className={`flex items-center gap-3 font-semibold p-3 rounded-xl transition duration-200 ${
              isActive ? 'bg-cc-maroon text-white shadow-md' : 'text-cc-navy hover:bg-cc-cream hover:text-cc-maroon'
            }`}>
              {link.icon} {link.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar Content */}
      <aside className={`w-64 bg-cc-offwhite p-6 border-r border-gray-200 flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-y-auto fixed md:static top-[60px] md:top-[80px] left-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CoordCamp Logo" className="h-8 object-contain" />
            <span className="text-lg font-playfair font-bold text-cc-maroon">CoordCamp</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-cc-maroon">
            <X size={24} />
          </button>
        </div>
      
      {user?.role === 'student' && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">Student Portal</h3>
          {renderLinks(studentLinks)}
        </div>
      )}

      {(user?.role === 'clubLeader' || user?.role === 'leader') && (
        <div>
          <h3 className="text-xs font-bold text-cc-gold uppercase tracking-wider mb-4 ml-2">Club Management</h3>
          {renderLinks(leaderLinks)}
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="mt-8">
          <h3 className="text-xs font-bold text-cc-maroon uppercase tracking-wider mb-4 ml-2">University Admin</h3>
          {renderLinks(adminLinks)}
        </div>
      )}
    </aside>
    </>
  );
}