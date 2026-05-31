import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserMinus, Shield, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';

export default function LeaderMembers() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      try {
        if (!user || !user.id) return;
        
        // Find clubs led by this user
        const { data: clubs, error: clubsError } = await supabase
          .from('clubs')
          .select('id')
          .eq('leader_id', user.id);
          
        if (clubsError) throw clubsError;
        
        if (!clubs || clubs.length === 0) {
          if (isMounted) {
            setMembers([]);
            setLoading(false);
          }
          return;
        }
        
        const clubIds = clubs.map(c => c.id);
        
        // Fetch members of these clubs
        const { data: memberData, error: membersError } = await supabase
          .from('club_members')
          .select('id, joined_at, student_id, profiles(full_name, email, student_id, role)')
          .in('club_id', clubIds);
          
        if (membersError) throw membersError;
        
        if (isMounted) {
          const formatted = (memberData || []).map(m => ({
            id: m.id,
            studentIdUuid: m.student_id,
            name: m.profiles?.full_name || 'Unknown',
            email: m.profiles?.email || 'N/A',
            studentId: m.profiles?.student_id || 'N/A',
            joined: new Date(m.joined_at).toLocaleDateString(),
            role: m.profiles?.role === 'clubLeader' ? 'Officer' : 'Member'
          }));
          setMembers(formatted);
        }
      } catch (err) {
        console.error("Error fetching members:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchMembers();
    return () => { isMounted = false; };
  }, [user]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKick = async (id) => {
    try {
      const { error } = await supabase.from('club_members').delete().eq('id', id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove member: ' + err.message);
    }
  };

  const handlePromote = async (memberId, studentIdUuid) => {
    try {
      // In a real system, you'd update their role in profiles or a specific club_role column.
      // Here we update their profile role to clubLeader (demo purposes).
      const { error } = await supabase.from('profiles').update({ role: 'clubLeader' }).eq('id', studentIdUuid);
      if (error) throw error;
      
      setMembers(members.map(m => m.id === memberId ? { ...m, role: 'Officer' } : m));
      toast.success('Member promoted to Officer');
    } catch (err) {
      toast.error('Failed to promote member: ' + err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cc-maroon w-12 h-12" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Club Members</h1>
          <p className="text-cc-navy text-lg">Manage your organization's roster.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-cc-maroon outline-none w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Name</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Student ID</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Role</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Joined</th>
              <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No members found.</td>
              </tr>
            ) : filteredMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 transition">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-cc-navy flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-cc-navy">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 font-semibold text-gray-600">{member.studentId}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.role === 'Officer' ? 'bg-yellow-100 text-cc-gold' : 'bg-gray-100 text-gray-600'}`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-6 text-sm text-gray-500">{member.joined}</td>
                <td className="p-6 text-right space-x-2">
                  <button className="p-2 text-gray-400 hover:text-cc-navy bg-white rounded-lg shadow-sm border border-gray-200 transition" title="Message">
                    <Mail size={16} />
                  </button>
                  {member.role !== 'Officer' && (
                    <button onClick={() => handlePromote(member.id, member.studentIdUuid)} className="p-2 text-gray-400 hover:text-cc-gold bg-white rounded-lg shadow-sm border border-gray-200 transition" title="Promote to Officer">
                      <Shield size={16} />
                    </button>
                  )}
                  <button onClick={() => handleKick(member.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-200 transition" title="Remove Member">
                    <UserMinus size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
