import { User, Mail, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cc-offwhite p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
      >
        <h1 className="text-3xl font-playfair font-bold text-cc-maroon mb-8">My Profile</h1>
        
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 bg-cc-cream rounded-full flex items-center justify-center text-cc-gold">
            <User size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cc-navy">{user.full_name || user.email?.split('@')[0] || 'User'}</h2>
            <p className="text-gray-500 capitalize flex items-center gap-1 mt-1">
              <Shield size={16} className="text-cc-gold" /> {user.role === 'clubLeader' ? 'Club Leader' : user.role}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase">Email Address</label>
            <div className="flex items-center gap-3 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Mail size={20} className="text-gray-400" />
              <p className="font-semibold text-cc-navy">{user.email}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
