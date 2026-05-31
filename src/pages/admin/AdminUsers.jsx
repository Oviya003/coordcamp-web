import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Search, Loader2, UserCog, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated successfully');
    } catch (err) {
      toast.error('Failed to update role: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.student_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cc-maroon w-12 h-12" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-2">Manage Users</h1>
          <p className="text-gray-500">View and update user roles across the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-cc-maroon outline-none w-72"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">User</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Student ID</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Credits</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Role</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No users found.</td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-cc-navy flex items-center justify-center font-bold">
                      {(user.full_name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-cc-navy">{user.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 font-semibold text-gray-600">{user.student_id || 'N/A'}</td>
                <td className="p-6 font-bold text-cc-maroon">{user.credits || 0}</td>
                <td className="p-6">
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className={`px-3 py-1 rounded-full text-xs font-bold outline-none cursor-pointer border ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' : 
                      user.role === 'clubLeader' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <option value="student">Student</option>
                    <option value="clubLeader">Club Leader</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-6 text-right space-x-2">
                   {updating === user.id ? (
                     <Loader2 size={16} className="animate-spin text-gray-400 inline" />
                   ) : (
                     <Check size={16} className="text-green-500 inline opacity-0" />
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
