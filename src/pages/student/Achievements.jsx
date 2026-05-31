import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { Trophy, Medal, Loader2, Star, Award, Zap } from 'lucide-react';

export default function Achievements() {
  const { user } = useAuthStore();
  const [data, setData] = useState({ credits: 0, achievements: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        if (!user) return;

        // Fetch user's profile for their credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        // Hardcoded badges logic based on credits
        const credits = profile?.credits || 0;
        const achievements = [
          { id: 1, title: 'First Steps', description: 'Attend your first event', icon: '🌟', unlocked: credits > 0 },
          { id: 2, title: 'Campus Regular', description: 'Earn 50 credits', icon: '🔥', unlocked: credits >= 50 },
          { id: 3, title: 'Social Butterfly', description: 'Earn 150 credits', icon: '🦋', unlocked: credits >= 150 },
          { id: 4, title: 'CoordCamp Legend', description: 'Earn 500 credits', icon: '👑', unlocked: credits >= 500 },
        ];

        setData({ credits, achievements });

        // Fetch leaderboard (top 10 profiles by credits)
        const { data: topProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, credits')
          .order('credits', { ascending: false })
          .limit(10);
        
        setLeaderboard(topProfiles || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Achievements</h1>
        <p className="text-cc-navy text-lg font-semibold">Track your campus engagement progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-cc-navy flex items-center gap-2">
            <Medal className="text-cc-gold" /> My Badges
          </h2>
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <div className="mb-6 flex justify-between items-center bg-cc-offwhite p-4 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-500 uppercase">Current Balance</span>
              <span className="text-3xl font-playfair font-bold text-cc-maroon">{data.credits} Credits</span>
            </div>
            <div className="space-y-4">
              {data.achievements.map(ach => (
                <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-xl border ${ach.unlocked ? 'bg-amber-50 border-cc-gold' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                  <div className="text-4xl">{ach.icon}</div>
                  <div>
                    <h4 className={`font-bold ${ach.unlocked ? 'text-cc-navy' : 'text-gray-500'}`}>{ach.title}</h4>
                    <p className="text-sm text-gray-600 font-semibold">{ach.description}</p>
                  </div>
                  {ach.unlocked && <span className="ml-auto bg-cc-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Unlocked</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-cc-navy flex items-center gap-2">
            <Trophy className="text-cc-gold" /> Top Students
          </h2>
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <div className="space-y-4">
              {leaderboard.map((student, index) => (
                <div key={student.id} className={`flex justify-between items-center p-4 border-b border-gray-100 last:border-0 rounded-lg ${user && student.id === user.id ? 'bg-amber-50 border border-cc-gold/50' : 'bg-cc-offwhite'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-xl ${index === 0 ? 'text-cc-gold text-2xl' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'}`}>#{index + 1}</span>
                    <span className="font-bold text-cc-navy text-lg">{student.full_name || 'Anonymous Student'}</span>
                  </div>
                  <span className="bg-cc-maroon text-white font-bold px-3 py-1 rounded-full text-sm shadow">{student.credits} cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
