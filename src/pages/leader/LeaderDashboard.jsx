import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, PlusCircle, CheckSquare, CreditCard, Bell, Bot, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function LeaderDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalEvents: 12,
    activeMembers: 156,
    attendanceRate: 85,
    creditsDistributed: 1250,
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [announcements] = useState([]);

  const analyticsData = [
    { name: 'Sep', attendance: 40 },
    { name: 'Oct', attendance: 65 },
    { name: 'Nov', attendance: 85 },
    { name: 'Dec', attendance: 60 },
    { name: 'Jan', attendance: 90 },
    { name: 'Feb', attendance: 110 },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const { data: events, error } = await supabase
          .from('events')
          .select('id, title, date')
          .eq('created_by', user.id)
          .order('date', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        if (isMounted && events) {
          setRecentEvents(events);
          setStats(prev => ({
            ...prev,
            totalEvents: events.length
          }));
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err.message);
        if (isMounted) {
           setRecentEvents([]);
        }
      }
    };

    if (user) fetchDashboardData();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Club Leader Dashboard</h1>
          <p className="text-cc-navy text-lg">Manage your organization and events.</p>
        </div>
        <Link to="/leader/create-event" className="bg-cc-maroon hover:bg-opacity-90 transition text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold shadow-lg">
          <PlusCircle size={20} /> Create Event
        </Link>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Total Events</p>
            <div className="bg-red-50 p-2 rounded-xl text-cc-maroon"><Calendar size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-cc-maroon">{stats.totalEvents}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Active Members</p>
            <div className="bg-blue-50 p-2 rounded-xl text-cc-navy"><Users size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-cc-navy">{stats.activeMembers}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Attendance Rate</p>
            <div className="bg-green-50 p-2 rounded-xl text-green-600"><CheckSquare size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-green-600">{stats.attendanceRate}%</h2>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Credits Distributed</p>
            <div className="bg-yellow-50 p-2 rounded-xl text-cc-gold"><CreditCard size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-cc-gold">{stats.creditsDistributed}</h2>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Manage Events & Attendance */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2">
                <Calendar size={24} className="text-cc-gold" /> Manage Events
              </h2>
              <button className="text-sm font-bold text-cc-maroon hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentEvents.length === 0 ? <p className="text-gray-500 italic">No events found.</p> : recentEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                  <div>
                    <h3 className="font-bold text-cc-navy">{event.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <Link to="/leader/events" className="text-xs font-bold text-gray-400 hover:text-cc-gold mt-1 transition">Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2">
                <BarChart2 size={24} className="text-cc-gold" /> Attendance Analytics
              </h2>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" stroke="#8B1A1A" fillOpacity={1} fill="url(#colorAtt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Features */}
        <div className="space-y-8">
          
          <div className="bg-cc-navy text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={100} />
            </div>
            <h2 className="text-2xl font-playfair font-bold mb-2 relative z-10">Credits Allocation</h2>
            <p className="text-gray-300 text-sm mb-6 relative z-10">Manage budget and credits for your club events.</p>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm relative z-10 border border-white/20">
              <p className="text-xs font-bold text-cc-gold uppercase tracking-wider mb-1">Available Balance</p>
              <p className="text-3xl font-bold font-playfair">2,450 <span className="text-lg">pts</span></p>
            </div>
            <button className="w-full mt-4 bg-cc-gold text-cc-navy font-bold py-3 rounded-xl hover:bg-white transition relative z-10">
              Allocate Credits
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2 mb-6">
              <Bell size={24} className="text-cc-gold" /> Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="border-l-4 border-cc-maroon pl-4 py-1">
                  <h3 className="font-bold text-sm text-cc-navy">{ann.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{ann.date}</p>
                </div>
              ))}
              <button className="w-full mt-4 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                Post Announcement
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-cc-offwhite to-white p-8 rounded-3xl shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-cc-maroon/5 rounded-full group-hover:scale-150 transition duration-500"></div>
            <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2 mb-2 relative z-10">
              <Bot size={24} className="text-cc-maroon" /> AI Assistant
            </h2>
            <p className="text-sm text-gray-500 mb-4 relative z-10">Get suggestions for events and automate member communications.</p>
            <button className="text-cc-maroon font-bold text-sm hover:underline relative z-10 flex items-center gap-1">
              Ask Assistant &rarr;
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}