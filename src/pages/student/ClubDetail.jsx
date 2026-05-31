import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { Users, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [club, setClub] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const { data, error } = await supabase.from('clubs').select('*').eq('id', id).single();
        if (error) throw error;
        setClub(data);

        // Check member count
        const { count } = await supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('club_id', id);
        setMemberCount(count || 0);

        // Check if user is member
        if (user) {
          const { data: membership } = await supabase.from('club_members').select('id').eq('club_id', id).eq('student_id', user.id).maybeSingle();
          if (membership) setIsMember(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id, user]);

  const handleJoin = async () => {
    try {
      const { error } = await supabase.from('club_members').insert({
        club_id: id,
        student_id: user.id
      });
      if (error) throw error;
      
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      toast.success('Successfully joined the club!');
    } catch (err) {
      toast.error('Failed to join club. You might already be a member.');
    }
  };

  if (loading || !club) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/student/clubs')} className="flex items-center gap-2 text-cc-navy font-bold mb-6 hover:text-cc-maroon transition">
        <ArrowLeft size={20} /> Back to Clubs
      </button>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-cc-teal p-8 h-48 flex flex-col justify-end">
          <span className="bg-white/20 text-white w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">{club.category || 'General'}</span>
          <h1 className="text-4xl font-playfair font-bold text-white">{club.name}</h1>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-bold font-playfair text-cc-navy mb-2">About Us</h3>
              <p className="text-gray-600 leading-relaxed">{club.description}</p>
            </div>
          </div>
          <div className="bg-cc-offwhite p-6 rounded-2xl space-y-4 border border-gray-200 h-fit">
            <div className="flex items-center gap-3"><Users className="text-cc-gold" /><p className="font-bold text-cc-navy">{memberCount} Active Members</p></div>
            
            {isMember ? (
              <div className="bg-cc-green text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 mt-4"><CheckCircle size={20} /> Joined</div>
            ) : (
              <button onClick={handleJoin} className="w-full bg-cc-teal text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition shadow mt-4">Join Club</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}