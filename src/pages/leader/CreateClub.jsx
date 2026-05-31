import { useState } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateClub() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    category: 'Academic' 
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Submitting form data:", formData);
    console.log("User ID:", user?.id);

    try {
      // Use raw fetch to bypass any Supabase SDK hanging issues for the live demo
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          leader_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || response.statusText);
      }
      
      toast.success('Club successfully created!');
      navigate('/leader/dashboard');
    } catch (err) {
      toast.error('Failed to create club: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Create a New Club</h1>
        <p className="text-gray-500 font-semibold text-lg">Register your organization in the university portal.</p>
      </div>

      <form onSubmit={submit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Club Name</label>
            <input 
              type="text" 
              placeholder="e.g. Computer Science Society" 
              required 
              className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl font-semibold" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              placeholder="What does your club do?" 
              rows="4" 
              required 
              className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl font-semibold resize-none" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-cc-offwhite border border-gray-200 rounded-xl font-bold appearance-none cursor-pointer" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Academic">Academic</option>
                <option value="Social">Social</option>
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
                <option value="Cultural">Cultural</option>
                <option value="Technology">Technology</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-cc-gold hover:bg-opacity-90 text-cc-navy p-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Register Club'}
        </button>
      </form>
    </motion.div>
  );
}
