import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Users, Calendar, Shield, AlertTriangle, FileText, Settings, Bot, CreditCard, BarChart2, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supabase } from '../../config/supabase';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClubs: 0,
    totalEvents: 0,
    attendanceRate: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const [
          { count: studentsCount },
          { count: clubsCount },
          { count: eventsCount },
          { count: attendanceCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('clubs').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('attendance').select('*', { count: 'exact', head: true })
        ]);

        if (isMounted) {
          // Mock attendance rate and pending approvals for now as they require complex aggregation
          setStats({
            totalStudents: studentsCount || 0,
            totalClubs: clubsCount || 0,
            totalEvents: eventsCount || 0,
            attendanceRate: attendanceCount > 0 ? 85 : 0, 
            pendingApprovals: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching admin stats", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const [alerts] = useState([
    { id: 1, type: 'fraud', message: 'Suspicious check-in activity at Event #402', time: '10 mins ago' },
    { id: 2, type: 'warning', message: 'Club "Tech Society" requires faculty approval', time: '1 hour ago' },
  ]);

  const analyticsData = [
    { name: 'Sep', value: 2000 },
    { name: 'Oct', value: 3500 },
    { name: 'Nov', value: 3800 },
    { name: 'Dec', value: 2500 },
    { name: 'Jan', value: 4100 },
    { name: 'Feb', value: 4520 },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cc-maroon w-12 h-12" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">University Admin</h1>
          <p className="text-cc-navy text-lg">Platform-wide statistics and management.</p>
        </div>
        <button className="bg-cc-navy hover:bg-opacity-90 transition text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
          <Settings size={20} /> System Settings
        </button>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Total Students</p>
            <div className="bg-yellow-50 p-2 rounded-xl text-cc-gold"><Users size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-cc-gold">{stats.totalStudents}</h2>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Total Clubs</p>
            <div className="bg-red-50 p-2 rounded-xl text-cc-maroon"><Shield size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-cc-maroon">{stats.totalClubs}</h2>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Total Events</p>
            <div className="bg-blue-50 p-2 rounded-xl text-cc-navy"><Calendar size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-cc-navy">{stats.totalEvents}</h2>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase">Attendance %</p>
            <div className="bg-green-50 p-2 rounded-xl text-green-600"><BarChart2 size={24} /></div>
          </div>
          <h2 className="text-4xl font-playfair font-bold text-green-600">{stats.attendanceRate}%</h2>
        </div>
        <div className="bg-cc-maroon text-white p-6 shadow-lg rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
             <AlertTriangle size={80} className="-mr-4 -mt-4" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-sm font-bold text-white/80 uppercase">Pending Approvals</p>
          </div>
          <h2 className="text-4xl font-playfair font-bold relative z-10">{stats.pendingApprovals}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2">
                <BarChart2 size={24} className="text-cc-gold" /> Attendance & Campus Analytics
              </h2>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A2E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1A1A2E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#1A1A2E" fillOpacity={1} fill="url(#colorAdmin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-cc-gold transition cursor-pointer">
              <CreditCard size={32} className="text-cc-gold mb-4" />
              <h3 className="text-lg font-bold text-cc-navy mb-2">Credit Management</h3>
              <p className="text-sm text-gray-500">Allocate budget and participation credits across all clubs.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-cc-maroon transition cursor-pointer">
              <FileText size={32} className="text-cc-maroon mb-4" />
              <h3 className="text-lg font-bold text-cc-navy mb-2">Reports</h3>
              <p className="text-sm text-gray-500">Export compliance and engagement reports for administration.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-red-100 relative">
            <h2 className="text-2xl font-playfair font-bold text-cc-maroon flex items-center gap-2 mb-6">
              <AlertTriangle size={24} /> Fraud Alerts
            </h2>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-sm font-bold text-cc-maroon">{alert.message}</p>
                  <p className="text-xs text-red-400 mt-2 font-semibold">{alert.time}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 bg-white border-2 border-cc-maroon text-cc-maroon font-bold py-3 rounded-xl hover:bg-red-50 transition text-sm">
              View All Logs
            </button>
          </div>

          <div className="bg-cc-navy p-8 rounded-3xl shadow-lg text-white">
            <h2 className="text-2xl font-playfair font-bold flex items-center gap-2 mb-4">
              <Bot size={24} className="text-cc-gold" /> Admin AI
            </h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Use the AI assistant to query campus-wide data, summarize recent incidents, or draft official communications.
            </p>
            <button className="w-full bg-cc-gold text-cc-navy font-bold py-3 rounded-xl hover:bg-white transition text-sm">
              Open Assistant
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}