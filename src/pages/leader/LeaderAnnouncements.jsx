import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Megaphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';

export default function LeaderAnnouncements() {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    setLoading(true);
    
    try {
      // 1. Get clubs led by this leader
      const { data: clubs } = await supabase.from('clubs').select('id').eq('leader_id', user.id);
      if (!clubs || clubs.length === 0) throw new Error("You do not manage any clubs.");
      
      const clubIds = clubs.map(c => c.id);
      
      // 2. Get all members of these clubs
      const { data: members } = await supabase.from('club_members').select('student_id').in('club_id', clubIds);
      if (!members || members.length === 0) throw new Error("Your clubs have no members to notify.");
      
      // Deduplicate student IDs
      const studentIds = [...new Set(members.map(m => m.student_id))];
      
      // 3. Create notifications
      const notifs = studentIds.map(studentId => ({
        user_id: studentId,
        title: isUrgent ? `[URGENT] ${title}` : title,
        message: message,
        is_read: false
      }));
      
      const { error } = await supabase.from('notifications').insert(notifs);
      if (error) throw error;
      
      toast.success(`Announcement sent to ${studentIds.length} members!`);
      
      // Add to local state to show in UI
      setRecent(prev => [{
        id: Date.now(),
        title: title,
        message: message,
        isUrgent: isUrgent,
        date: 'Just now'
      }, ...prev].slice(0, 5));
      
      setTitle('');
      setMessage('');
      setIsUrgent(false);
    } catch (err) {
      toast.error(err.message || "Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Announcements</h1>
        <p className="text-cc-navy text-lg">Broadcast messages to all your club members instantly.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <Megaphone size={24} className="text-cc-gold" /> Compose Message
        </h2>

        <form onSubmit={handlePost} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Room Change for Tonight's Meeting" 
              className="w-full px-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
            <textarea 
              rows="5"
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your announcement here..." 
              className="w-full px-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon resize-none" 
            />
          </div>

          <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
            <input 
              type="checkbox" 
              id="urgent" 
              className="w-5 h-5 accent-cc-maroon"
              checked={isUrgent}
              onChange={e => setIsUrgent(e.target.checked)}
            />
            <div>
              <label htmlFor="urgent" className="font-bold text-cc-maroon cursor-pointer block">Mark as Urgent (Push Notification)</label>
              <p className="text-xs text-red-400 font-semibold mt-1">This will send an immediate mobile alert to all members. Use sparingly.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-cc-maroon hover:bg-opacity-90 transition text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Post Announcement
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <Bell size={20} className="text-gray-400" />
          <h2 className="text-xl font-bold text-cc-navy">Recent Broadcasts</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recent.length === 0 ? (
            <div className="p-6 text-gray-500 italic">No recent broadcasts this session.</div>
          ) : recent.map(r => (
            <div key={r.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${r.isUrgent ? 'text-cc-maroon' : 'text-cc-navy'}`}>
                  {r.isUrgent && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">Urgent</span>}
                  {r.title}
                </h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{r.date}</span>
              </div>
              <p className="text-gray-600 text-sm">{r.message}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
