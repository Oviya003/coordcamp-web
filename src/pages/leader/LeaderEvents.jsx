import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Edit, PlusCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LeaderEvents() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEvents = async () => {
      try {
        if (!user || !user.id) return;
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        
        if (isMounted) setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err.message);
        if (isMounted) setEvents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchEvents();
    
    return () => { isMounted = false; };
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete event. Mock data cannot be deleted.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cc-maroon w-12 h-12" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">My Events</h1>
          <p className="text-cc-navy text-lg">Manage and track events you have created.</p>
        </div>
        <Link to="/leader/create-event" className="bg-cc-maroon hover:bg-opacity-90 transition text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold shadow-lg">
          <PlusCircle size={20} /> Create Event
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-300 w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-cc-navy mb-2">No Events Found</h3>
            <p className="text-gray-500 mb-6">You haven't created any events yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map(event => (
              <div key={event.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition group">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-4 rounded-2xl text-cc-maroon">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-cc-navy">{event.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} at {event.location}</p>
                    <p className="text-xs font-semibold text-cc-gold mt-1">Capacity: {event.capacity}</p>
                  </div>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                  <button className="p-2 text-gray-400 hover:text-cc-navy bg-white rounded-lg shadow-sm border border-gray-100 transition">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
