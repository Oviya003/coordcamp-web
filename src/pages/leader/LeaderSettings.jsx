import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Image as ImageIcon, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';

export default function LeaderSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubId, setClubId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    description: '',
    isPrivate: false,
    requireApproval: true
  });

  useEffect(() => {
    let isMounted = true;
    const fetchClub = async () => {
      try {
        if (!user || !user.id) return;
        const { data, error } = await supabase.from('clubs').select('*').eq('leader_id', user.id).limit(1).single();
        if (error) throw error;
        
        if (isMounted && data) {
          setClubId(data.id);
          setFormData({
            name: data.name || '',
            category: data.category || 'General',
            description: data.description || '',
            isPrivate: false,
            requireApproval: true
          });
        }
      } catch (err) {
        console.warn("Could not load club settings", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClub();
    return () => { isMounted = false; };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!clubId) {
      toast.error("No club found to update.");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase.from('clubs').update({
        name: formData.name,
        category: formData.category,
        description: formData.description
      }).eq('id', clubId);
      
      if (error) throw error;
      toast.success('Club settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update club: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cc-maroon w-12 h-12" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Club Settings</h1>
        <p className="text-cc-navy text-lg">Configure your organization's profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-32 h-32 bg-cc-offwhite rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-gray-400 overflow-hidden relative group cursor-pointer">
              <span className="text-4xl font-playfair font-bold text-cc-navy">CS</span>
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon size={24} className="text-white mb-1" />
                <span className="text-xs text-white font-bold">Upload Logo</span>
              </div>
            </div>
            <h2 className="font-bold text-lg text-cc-navy">{formData.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{formData.category}</p>
            <button className="text-sm font-bold text-cc-maroon border border-cc-maroon rounded-lg px-4 py-2 w-full hover:bg-red-50 transition">
              Change Logo
            </button>
          </div>

          <div className="bg-cc-navy text-white p-6 rounded-3xl shadow-sm">
             <ShieldCheck size={32} className="text-cc-gold mb-4" />
             <h3 className="font-bold text-lg mb-2">Verified Organization</h3>
             <p className="text-sm text-gray-300">Your club is officially recognized by the University Administration.</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Settings size={24} className="text-cc-gold" /> General Configuration
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Club Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon font-semibold" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon font-semibold"
              >
                <option value="Academic">Academic</option>
                <option value="Social">Social</option>
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                rows="4"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon resize-none" 
              />
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="font-bold text-lg text-cc-navy mb-4">Privacy & Access</h3>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isPrivate}
                  onChange={e => setFormData({...formData, isPrivate: e.target.checked})}
                  className="w-5 h-5 accent-cc-maroon" 
                />
                <div>
                  <span className="font-bold text-gray-700 block group-hover:text-cc-maroon transition">Private Club</span>
                  <span className="text-xs text-gray-500">Hide from the public directory. Only invited students can view.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.requireApproval}
                  onChange={e => setFormData({...formData, requireApproval: e.target.checked})}
                  className="w-5 h-5 accent-cc-maroon" 
                />
                <div>
                  <span className="font-bold text-gray-700 block group-hover:text-cc-maroon transition">Require Approval to Join</span>
                  <span className="text-xs text-gray-500">New members must be manually approved by officers.</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button type="submit" disabled={saving} className="bg-cc-maroon hover:bg-opacity-90 transition text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
