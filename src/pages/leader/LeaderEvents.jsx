import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Edit, PlusCircle, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LeaderEvents() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEvents = async () => {
      try {
        if (!user || !user.id) return;
        
        // Step 1: Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', user.id)
          .order('date', { ascending: false });

        if (eventsError) throw eventsError;
        
        if (!eventsData || eventsData.length === 0) {
          if (isMounted) setEvents([]);
          return;
        }

        // Step 2: Fetch attendance separately to avoid any nested query issues
        const eventIds = eventsData.map(e => e.id);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, event_id, method, profiles(full_name, email, student_id)')
          .in('event_id', eventIds);

        if (attendanceError) {
          console.error("ATTENDANCE ERROR:", attendanceError);
          toast.error("Database blocked attendance: " + attendanceError.message);
        }

        // Map attendance back to events even if attendance fetch fails
        const finalEvents = eventsData.map(event => {
          return {
            ...event,
            attendance: attendanceError ? [] : (attendanceData || []).filter(a => a.event_id === event.id)
          };
        });
        
        if (isMounted) setEvents(finalEvents);
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
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete event. Mock data cannot be deleted.');
    }
  };

  const toggleExpand = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
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
        <div className="flex gap-4">
          <button 
            onClick={async () => {
              const { data, error } = await supabase.from('attendance').select('*');
              if (error) alert("ERROR: " + error.message);
              else alert("ATTENDANCE ROWS FOUND: " + data.length + "\n\n" + JSON.stringify(data.slice(0,2)));
            }}
            className="bg-yellow-400 hover:bg-yellow-500 transition text-black px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold shadow-lg"
          >
            TEST DATABASE
          </button>
          <Link to="/leader/create-event" className="bg-cc-maroon hover:bg-opacity-90 transition text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold shadow-lg">
            <PlusCircle size={20} /> Create Event
          </Link>
        </div>
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
              <div key={event.id} className="group">
                <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer" onClick={() => toggleExpand(event.id)}>
                  <div className="flex items-center gap-4">
                    <div className="bg-red-50 p-4 rounded-2xl text-cc-maroon">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-cc-navy flex items-center gap-2">
                        {event.title}
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Users size={12} /> {event.attendance?.length || 0} Attended
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} at {event.location}</p>
                      <p className="text-xs font-semibold text-cc-gold mt-1">Capacity: {event.capacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 text-gray-400 hover:text-cc-navy bg-white rounded-lg shadow-sm border border-gray-100 transition">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="text-gray-400 p-2">
                      {expandedEventId === event.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedEventId === event.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50 border-t border-gray-100"
                    >
                      <div className="p-6">
                        <h4 className="font-bold text-cc-navy mb-4 flex items-center gap-2"><Users size={18} /> Attendance List</h4>
                        {(!event.attendance || event.attendance.length === 0) ? (
                          <p className="text-sm text-gray-500 italic bg-white p-4 rounded-xl border border-gray-200">No students have checked into this event yet.</p>
                        ) : (
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                  <th className="px-4 py-3 font-semibold">Student Name</th>
                                  <th className="px-4 py-3 font-semibold">Student ID</th>
                                  <th className="px-4 py-3 font-semibold">Email</th>
                                  <th className="px-4 py-3 font-semibold">Check-in Method</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {event.attendance.map(record => (
                                  <tr key={record.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-cc-navy">{record.profiles?.full_name || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-gray-600">{record.profiles?.student_id || 'N/A'}</td>
                                    <td className="px-4 py-3 text-gray-500">{record.profiles?.email || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                        record.method === 'qr' ? 'bg-purple-100 text-purple-700' :
                                        record.method === 'geofence' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {record.method ? record.method.toUpperCase() : 'MANUAL'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
