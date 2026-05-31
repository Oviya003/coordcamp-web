import { Link } from 'react-router-dom';
import { Bell, User, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuthStore();
  
  return (
    <nav className="bg-cc-maroon text-cc-offwhite px-4 md:px-6 py-4 flex justify-between items-center shadow-md z-50 relative">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="md:hidden text-white mr-2">
            <Menu size={24} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="CoordCamp Logo" className="h-8 md:h-10 object-contain drop-shadow-sm" />
          <span className="text-xl md:text-2xl font-playfair font-bold text-cc-gold tracking-wide hidden sm:block">CoordCamp</span>
        </Link>
      </div>
      <div className="flex gap-4 md:gap-6 items-center">
        {user ? (
          <>
            <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'leader' || user.role === 'clubLeader' ? 'leader' : 'student'}/notifications`} className="hover:text-cc-gold transition relative mt-1">
              <Bell size={24} />
            </Link>
            <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'leader' || user.role === 'clubLeader' ? 'leader' : 'student'}/profile`} className="hover:text-cc-gold transition relative mt-1 hidden sm:block">
              <User size={24} />
            </Link>
            <div className="h-6 w-px bg-white/20 mx-1 md:mx-2 hidden sm:block"></div>
            <span className="font-semibold text-cc-cream hidden md:block">Hello, {user.name}</span>
            <button onClick={async () => { 
              localStorage.clear();
              sessionStorage.clear();
              logout(); 
              window.location.href = '/'; 
            }} className="bg-cc-gold text-cc-navy px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-sm text-sm md:text-base">
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}