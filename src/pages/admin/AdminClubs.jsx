import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Search, Loader2, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase.from('clubs').select('*, profiles(full_name)').order('created_at', { ascending: false });
      if (error) throw error;
      setClubs(data || []);
    } catch (err) {
      toast.error('Failed to load clubs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    
    try {
      const { error } = await supabase.from('clubs').delete().eq('id', id);
      if (error) throw error;
      
      setClubs(clubs.filter(c => c.id !== id));
      toast.success('Club deleted successfully');
    } catch (err) {
      toast.error('Failed to delete club: ' + err.message);
    }
  };

  const filteredClubs = clubs.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cc-maroon w-12 h-12" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-2">Manage Clubs</h1>
          <p className="text-gray-500">View and manage all active organizations.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search clubs..." 
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
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Club Name</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Category</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Leader</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Created</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClubs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No clubs found.</td>
              </tr>
            ) : filteredClubs.map(club => (
              <tr key={club.id} className="hover:bg-gray-50 transition">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-cc-maroon flex items-center justify-center font-bold">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-cc-navy">{club.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                   <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                    {club.category || 'General'}
                   </span>
                </td>
                <td className="p-6 font-semibold text-gray-600">{club.profiles?.full_name || 'N/A'}</td>
                <td className="p-6 text-sm text-gray-500">{new Date(club.created_at).toLocaleDateString()}</td>
                <td className="p-6 text-right space-x-2">
                   <button onClick={() => handleDelete(club.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-200 transition" title="Delete Club">
                     <Trash2 size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
