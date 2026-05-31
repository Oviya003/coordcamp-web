import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Building } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Welcome() {
  const { user } = useAuthStore();
  
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'leader' || user.role === 'clubLeader') return <Navigate to="/leader/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-cc-offwhite flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-cc-maroon mb-4">
            Select Your Path
          </h1>
          <p className="text-gray-500 font-semibold max-w-md mx-auto">
            Join the university community and manage your extracurricular life with ease.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-col w-full max-w-lg gap-4"
        >
          {/* Student Card */}
          <Link to="/login/student" className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-cc-maroon hover:shadow-md transition-shadow group flex items-center gap-6">
            <div className="bg-red-50 p-4 rounded-2xl text-cc-maroon group-hover:bg-cc-maroon group-hover:text-white transition-colors">
              <GraduationCap size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy mb-1">Student</h2>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">Explore clubs and manage your campus involvement.</p>
            </div>
            <div className="text-gray-300 group-hover:text-cc-maroon transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </Link>

          {/* Club Leader Card */}
          <Link to="/login/leader" className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-cc-gold hover:shadow-md transition-shadow group flex items-center gap-6">
            <div className="bg-yellow-50 p-4 rounded-2xl text-cc-gold group-hover:bg-cc-gold group-hover:text-white transition-colors">
              <Users size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy mb-1">Club Leader</h2>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">Manage your organization and host camp events.</p>
            </div>
            <div className="text-gray-300 group-hover:text-cc-gold transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </Link>

          {/* Admin Card */}
          <Link to="/login/admin" className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-cc-green hover:shadow-md transition-shadow group flex items-center gap-6">
            <div className="bg-green-50 p-4 rounded-2xl text-cc-green group-hover:bg-cc-green group-hover:text-white transition-colors">
              <Building size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy mb-1">University Admin</h2>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">Oversee university-wide programs and safety.</p>
            </div>
            <div className="text-gray-300 group-hover:text-cc-green transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </Link>
          
        </motion.div>
      </div>
    </div>
  );
}