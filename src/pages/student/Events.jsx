import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true });
        
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Campus Events</h1>
        <p className="text-cc-navy text-lg">Discover and register for upcoming activities.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">No events found.</p>
        ) : (
          events.map(event => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={event.id} 
              className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition flex flex-col overflow-hidden"
            >
            <div className="h-24 bg-cc-maroon p-6 flex items-end relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
              <h3 className="text-xl font-playfair font-bold text-white line-clamp-1 relative z-10">{event.title}</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="bg-cc-cream text-cc-maroon text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 border border-cc-maroon/20">
                {event.category}
              </span>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">{event.description}</p>
              <div className="space-y-3 text-sm text-gray-500 font-semibold mb-6">
                <div className="flex items-center gap-3"><Calendar size={18} className="text-cc-navy" /> {new Date(event.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-3"><MapPin size={18} className="text-cc-navy" /> {event.location}</div>
              </div>
              <Link to={`/student/events/${event.id}`} className="w-full text-center bg-cc-maroon text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition shadow-md">
                View Details
              </Link>
            </div>
          </motion.div>
        )))}
      </div>
    </motion.div>
  );
}