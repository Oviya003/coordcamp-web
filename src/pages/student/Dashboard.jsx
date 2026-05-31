import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { Award, Calendar, Users, ArrowRight, Loader2, Sparkles, Shield, Bot, Bell, Trophy, TrendingUp, Compass, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const { count: eventsAttended, error: err1 } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id);

        const { count: activeClubs, error: err2 } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id);

        const { data: upcomingEvents, error: err3 } = await supabase
          .from('events')
          .select('*')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(3);
          
        const { data: notifications, error: err4 } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);
          
        const { data: recommendedClubs, error: err5 } = await supabase
          .from('clubs')
          .select('*')
          .limit(2);

        if (err1 || err2 || err3 || err4 || err5) {
          throw new Error("Database tables missing or query failed");
        }

        if (isMounted) {
          setData({
            stats: {
              credits: user.credits || 0,
              eventsAttended: eventsAttended || 0,
              activeClubs: activeClubs || 0,
              attendancePercent: eventsAttended > 0 ? Math.min(100, (eventsAttended / 10) * 100) : 0, // Mock calculation
              leaderboardRank: 42
            },
            upcomingEvents: upcomingEvents || [],
            notifications: notifications || [],
            recommendedClubs: recommendedClubs || []
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
        if (isMounted) {
          setData({
            stats: { credits: 0, eventsAttended: 0, activeClubs: 0, attendancePercent: 0, leaderboardRank: '-' },
            upcomingEvents: [],
            notifications: [],
            recommendedClubs: []
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    
    return () => { isMounted = false; };
  }, [user]);


  const handlePromoteToLeader = async () => {
    try {
      const { error } = await supabase.from('profiles').update({ role: 'clubLeader' }).eq('id', user.id);
      if (error) throw error;
      toast.success('Successfully promoted to Leader! Please sign out and sign back in to refresh permissions.');
    } catch (err) {
      toast.error('Promotion failed: ' + err.message);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-1">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-cc-navy text-lg font-semibold">Your Campus Life at a Glance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePromoteToLeader}
            className="flex items-center gap-2 bg-white text-cc-navy px-4 py-2 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition shadow-sm"
          >
            <Shield size={16} className="text-cc-gold" /> Become Leader
          </button>
          <Link to="/student/profile" className="flex items-center justify-center w-10 h-10 bg-cc-navy text-white rounded-xl shadow-sm hover:bg-opacity-90 transition">
            <UserIcon size={18} />
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-cc-gold transition">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credits</p>
            <p className="text-3xl font-playfair font-bold text-cc-navy mt-1">{data.stats.credits}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-xl group-hover:scale-110 transition">
            <Award size={24} className="text-cc-gold" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-cc-maroon transition">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance Rate</p>
            <p className="text-3xl font-playfair font-bold text-cc-navy mt-1">{data.stats.attendancePercent}%</p>
          </div>
          <div className="bg-red-50 p-3 rounded-xl group-hover:scale-110 transition">
            <TrendingUp size={24} className="text-cc-maroon" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-cc-teal transition">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Clubs</p>
            <p className="text-3xl font-playfair font-bold text-cc-navy mt-1">{data.stats.activeClubs}</p>
          </div>
          <div className="bg-teal-50 p-3 rounded-xl group-hover:scale-110 transition">
            <Users size={24} className="text-cc-teal" />
          </div>
        </div>

        <div className="bg-cc-maroon p-5 rounded-2xl shadow-md flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Campus Rank</p>
            <p className="text-3xl font-playfair font-bold text-white mt-1">#{data.stats.leaderboardRank}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl relative z-10 backdrop-blur-sm">
            <Trophy size={24} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Events */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-playfair font-bold text-cc-navy flex items-center gap-2">
                <Calendar className="text-cc-maroon" size={20} /> Upcoming Events
              </h2>
              <Link to="/student/events" className="text-sm font-bold text-cc-gold hover:underline">View All</Link>
            </div>
            
            {data.upcomingEvents.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                <p className="text-gray-500 font-semibold mb-4">No events scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-cc-offwhite rounded-xl border border-gray-100 hover:border-cc-maroon/30 transition group cursor-pointer" onClick={() => window.location.href = `/student/events/${event.id}`}>
                    <div>
                      <h4 className="font-bold text-cc-navy group-hover:text-cc-maroon transition">{event.title}</h4>
                      <p className="text-xs font-semibold text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-cc-maroon group-hover:text-white transition">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dual Panel: Notifications & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-playfair font-bold text-cc-navy mb-4 flex items-center gap-2">
                <Bell className="text-cc-gold" size={20} /> Recent Alerts
              </h2>
              <div className="space-y-3">
                {data.notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 font-semibold italic">You're all caught up!</p>
                ) : (
                  data.notifications.map(note => (
                    <div key={note.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <h5 className="font-bold text-sm text-cc-navy">{note.title}</h5>
                      <p className="text-xs text-gray-600 font-medium mt-1">{note.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-playfair font-bold text-cc-navy mb-4 flex items-center gap-2">
                <Compass className="text-cc-teal" size={20} /> Suggested Clubs
              </h2>
              <div className="space-y-3">
                {data.recommendedClubs.length === 0 ? (
                  <p className="text-sm text-gray-400 font-semibold italic">No recommendations yet.</p>
                ) : (
                  data.recommendedClubs.map(club => (
                    <div key={club.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <h5 className="font-bold text-sm text-cc-navy">{club.name}</h5>
                        <p className="text-xs text-gray-500 font-medium">{club.category}</p>
                      </div>
                      <Link to={`/student/clubs/${club.id}`} className="text-xs font-bold text-cc-teal hover:underline">View</Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Quick Tools */}
          <div className="bg-cc-navy rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white opacity-5"></div>
            <h2 className="text-xl font-playfair font-bold mb-4 relative z-10">Quick Tools</h2>
            <div className="space-y-2 relative z-10">
              <Link to="/student/qr" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl font-bold transition">
                <span>📷 Scan QR</span> <ArrowRight size={16} className="opacity-50" />
              </Link>
              <Link to="/student/geofence" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl font-bold transition">
                <span>📍 Location Check-in</span> <ArrowRight size={16} className="opacity-50" />
              </Link>
              <Link to="/student/achievements" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl font-bold transition">
                <span>🏆 Achievements</span> <ArrowRight size={16} className="opacity-50" />
              </Link>
            </div>
          </div>

          {/* AI Assistant Widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-500">
              <Bot size={64} className="text-indigo-900" />
            </div>
            <h2 className="text-xl font-playfair font-bold text-indigo-900 mb-2 relative z-10">AI Assistant</h2>
            <p className="text-sm text-indigo-800/70 font-semibold mb-4 relative z-10 pr-8">
              Got questions about campus life, credits, or events? Ask your AI guide!
            </p>
            <Link to="/student/ai" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-md relative z-10 w-full justify-center">
              <Sparkles size={16} /> Chat Now
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  );
}