import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, ArrowDownRight, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import { usersService } from '../../services/usersService';
import useAuthStore from '../../store/authStore';

export default function LeaderCredits() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!amount || !recipient) return;
    setLoading(true);
    
    try {
      // Find the user UUID by student_id
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('student_id', recipient);

      if (profileError || !profiles || profiles.length === 0) {
        throw new Error("Student not found. Please verify the Student ID.");
      }

      const studentIdUuid = profiles[0].id;
      
      await usersService.awardCredits(
        studentIdUuid, 
        parseInt(amount), 
        'Manual Allocation by Club Leader', 
        user.id
      );

      toast.success(`Successfully allocated ${amount} credits to ${profiles[0].full_name}`);
      setAmount('');
      setRecipient('');
    } catch (err) {
      toast.error(err.message || 'Failed to allocate credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Credit Management</h1>
        <p className="text-cc-navy text-lg">Allocate and track club participation credits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-cc-navy text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={120} />
            </div>
            <p className="text-sm font-bold text-cc-gold uppercase tracking-wider mb-2 relative z-10">Total Budget</p>
            <h2 className="text-5xl font-playfair font-bold mb-8 relative z-10">2,450 <span className="text-xl">pts</span></h2>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Distributed this month</span>
                <span className="font-bold text-green-400">+450 pts</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleAllocate} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-lg text-cc-navy border-b border-gray-100 pb-2 mb-4">Allocate Credits</h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Recipient Student ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  required
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. S123456" 
                  className="w-full pl-10 pr-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
              <input 
                type="number" 
                min="1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0" 
                className="w-full px-4 py-3 bg-cc-offwhite border border-gray-200 rounded-xl outline-none focus:border-cc-maroon" 
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-cc-maroon hover:bg-opacity-90 transition text-white py-3 rounded-xl font-bold shadow-md mt-4 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null} Transfer Credits
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-cc-navy">Transaction History</h2>
              <button className="text-sm font-bold text-cc-gold hover:underline">Export CSV</button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {[
                { id: 1, type: 'Event Reward', desc: 'Fall Kickoff Meeting', amount: 10, date: 'Today, 2:30 PM', student: 'Alice Smith' },
                { id: 2, type: 'Manual Allocation', desc: 'Extra help with setup', amount: 25, date: 'Yesterday', student: 'Bob Johnson' },
                { id: 3, type: 'Event Reward', desc: 'Leadership Workshop', amount: 15, date: 'Oct 15', student: 'Multiple (30)' },
                { id: 4, type: 'Budget Refresh', desc: 'University Admin Allocation', amount: 1000, date: 'Oct 1', student: 'Club Treasury', isReceive: true },
              ].map(tx => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.isReceive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {tx.isReceive ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-cc-navy">{tx.desc}</p>
                      <p className="text-sm text-gray-500">{tx.type} &bull; {tx.student}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.isReceive ? 'text-green-600' : 'text-gray-800'}`}>
                      {tx.isReceive ? '+' : '-'}{tx.amount}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
