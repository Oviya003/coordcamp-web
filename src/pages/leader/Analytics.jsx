import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        
        // Fetch events created by this leader
        const { data: events, error } = await supabase
          .from('events')
          .select('id, title')
          .eq('created_by', user.id);
          
        if (error) throw error;
        
        if (!events || events.length === 0) {
          setData([]);
          return;
        }

        const eventIds = events.map(e => e.id);
        
        // Fetch all attendance for these events
        const { data: attendance } = await supabase
          .from('attendance')
          .select('event_id')
          .in('event_id', eventIds);

        // Group attendance counts by event
        const chartData = events.map(event => {
          const count = attendance?.filter(a => a.event_id === event.id).length || 0;
          return {
            name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
            attendance: count
          };
        });

        setData(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Event Analytics</h1>
      <p className="text-cc-navy mb-8">Attendance breakdown across your published events.</p>
      
      <div className="h-96 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700">
          <TrendingUp className="text-cc-gold" /> Check-in Trends
        </h2>
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
            No events published yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="attendance" fill="#8B1A1A" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}