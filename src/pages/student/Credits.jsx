import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { Award, TrendingUp, Medal, Star, Shield, Gift, Loader2 } from 'lucide-react';
import { usersService } from '../../services/usersService';

export default function Credits() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [creditsData, leaderboardData] = await Promise.all([
          usersService.getCredits(user.id),
          usersService.getLeaderboard()
        ]);
        
        if (isMounted) {
          setCredits(creditsData || []);
          
          // Ensure the user is always in the leaderboard view even if they aren't top 50, for context
          let displayLeaderboard = leaderboardData || [];
          const userInTop = displayLeaderboard.find(p => p.student_id === user.id);
          
          if (!userInTop && user) {
            displayLeaderboard.push({
              student_id: user.id,
              total_credits: user.credits || 0,
              profiles: { full_name: user.full_name, role: user.role },
              isUser: true,
              rank: '-' // Not in top 50
            });
          }
          
          // Mark the current user in the array
          const finalLeaderboard = displayLeaderboard.map(p => ({
            ...p,
            isUser: p.student_id === user.id
          }));
          
          setLeaderboard(finalLeaderboard);
        }
      } catch (err) {
        console.error("Error fetching credits:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    if (user) fetchData();
    
    return () => { isMounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-navy mb-2">My Credits & Rewards</h1>
        <p className="text-gray-500 font-semibold">Track your campus involvement and see how you rank.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gradient-to-r from-cc-maroon to-red-800 rounded-3xl p-8 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">Total Balance</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-playfair font-black">{user?.credits || 120}</span>
                <span className="text-xl font-bold text-white/80 pb-2">CC</span>
              </div>
            </div>
            <Award size={80} className="text-white/20 relative z-10" />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-playfair font-bold text-cc-navy mb-6 flex items-center gap-2">
              <TrendingUp className="text-cc-gold" size={20} /> Credit History
            </h2>
            <div className="space-y-4">
              {credits.length === 0 ? <p className="text-sm text-gray-500">No credit history.</p> : credits.map(credit => (
                <div key={credit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-lg text-green-700">
                      <Star size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-cc-navy">{credit.reason}</h4>
                      <p className="text-xs font-semibold text-gray-500">{new Date(credit.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-lg">+{credit.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-playfair font-bold text-cc-navy mb-6 flex items-center gap-2">
              <Medal className="text-cc-teal" size={20} /> Campus Top 10
            </h2>
            <div className="space-y-3">
              {leaderboard.length === 0 ? <p className="text-sm text-gray-500">No data available.</p> : leaderboard.map((player, idx) => (
                <div key={player.student_id} className={`flex items-center justify-between p-3 rounded-xl border ${player.isUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500 text-lg' : idx === 1 ? 'text-gray-400 text-lg' : idx === 2 ? 'text-amber-600 text-lg' : 'text-gray-400'}`}>
                      {player.rank}
                    </span>
                    <span className={`font-bold ${player.isUser ? 'text-blue-900' : 'text-cc-navy'}`}>
                      {player.profiles?.full_name || 'Unknown Student'}
                    </span>
                  </div>
                  <span className="font-bold text-cc-maroon">{player.total_credits}</span>
                </div>
              ))}
              <div className="text-center pt-4 border-t border-gray-100">
                <button className="text-sm font-bold text-cc-gold hover:underline">View Full Leaderboard</button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-100 shadow-sm text-center">
            <Gift size={48} className="text-orange-400 mx-auto mb-4" />
            <h3 className="font-playfair font-bold text-lg text-orange-900 mb-2">Rewards Store</h3>
            <p className="text-sm text-orange-800/70 font-semibold mb-4">Spend your hard-earned credits on campus merch!</p>
            <button className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl hover:bg-orange-600 transition shadow-sm">
              Browse Rewards
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
