import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { Bell, Loader2 } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (!user) return;
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setNotes(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-6 flex items-center gap-3">
        <Bell className="w-8 h-8" /> Notifications
      </h1>
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-gray-500 italic bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            No notifications yet.
          </div>
        ) : (
          notes.map(n => (
            <div key={n.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${n.is_read ? 'border-gray-100 opacity-70' : 'border-cc-maroon/20'}`}>
              <h3 className="font-bold text-cc-navy text-lg mb-2">{n.title}</h3>
              <p className="text-gray-600">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}