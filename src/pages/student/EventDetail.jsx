import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { Calendar, MapPin, Users, Award, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) throw error;
        setEvent(data);

        // Check total attendance for capacity
        const { count } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('event_id', id);
        setAttendanceCount(count || 0);

        // Check if current user is registered
        if (user) {
          const { data: attendance } = await supabase.from('attendance').select('id').eq('event_id', id).eq('student_id', user.id).maybeSingle();
          if (attendance) setIsRegistered(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    try {
      const { error } = await supabase.from('attendance').insert({
        event_id: id,
        student_id: user.id,
        method: 'manual' // self-registration
      });
      if (error) throw error;
      
      setIsRegistered(true);
      setAttendanceCount(prev => prev + 1);
      toast.success('Successfully registered for event!');
    } catch (err) {
      toast.error('Failed to register. You might already be registered.');
    }
  };

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard/events')} className="flex items-center gap-2 text-cc-navy font-bold mb-6 hover:text-cc-maroon transition">
        <ArrowLeft size={20} /> Back to Events
      </button>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-cc-maroon p-8 h-48 flex flex-col justify-end">
          <span className="bg-white/20 text-white w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">{event.category}</span>
          <h1 className="text-4xl font-playfair font-bold text-white">{event.title}</h1>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div><h3 className="text-xl font-bold font-playfair text-cc-navy mb-2">Description</h3><p className="text-gray-600 leading-relaxed">{event.description}</p></div>
          </div>
          <div className="bg-cc-offwhite p-6 rounded-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3"><Calendar className="text-cc-gold" /><p className="font-bold text-cc-navy">{new Date(event.date).toLocaleDateString()}</p></div>
            <div className="flex items-center gap-3"><MapPin className="text-cc-gold" /><p className="font-bold text-cc-navy">{event.location}</p></div>
            <div className="flex items-center gap-3"><Users className="text-cc-gold" /><p className="font-bold text-cc-navy">{attendanceCount} / {event.capacity} Full</p></div>
            <div className="flex items-center gap-3"><Award className="text-cc-gold" /><p className="font-bold text-cc-navy">{event.credits} Credits</p></div>
            
            {isRegistered ? (
              <div className="bg-cc-green text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 mt-4"><CheckCircle size={20} /> Registered</div>
            ) : (
              <button onClick={handleRegister} className="w-full bg-cc-maroon text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition shadow mt-4">Register Now</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}