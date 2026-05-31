import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  
  return (
    <nav className="bg-cc-maroon text-cc-offwhite px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="CoordCamp Logo" className="h-10 object-contain drop-shadow-sm" />
        <span className="text-2xl font-playfair font-bold text-cc-gold tracking-wide hidden sm:block">CoordCamp</span>
      </Link>
      <div className="flex gap-6 items-center">
        {user ? (
          <>
            <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'leader' || user.role === 'clubLeader' ? 'leader' : 'student'}/notifications`} className="hover:text-cc-gold transition relative mt-1">
              <Bell size={24} />
            </Link>
            <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'leader' || user.role === 'clubLeader' ? 'leader' : 'student'}/profile`} className="hover:text-cc-gold transition relative mt-1">
              <User size={24} />
            </Link>
            <div className="h-6 w-px bg-white/20 mx-2"></div>
            <span className="font-semibold text-cc-cream">Hello, {user.name}</span>
            <button onClick={() => { logout(); window.location.href = '/'; }} className="bg-cc-gold text-cc-navy px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-sm">
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}