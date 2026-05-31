import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we actually have the recovery hash in URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      // In some OAuth flows or email link flows, Supabase might automatically parse the hash.
      // We will proceed but the user might get an error if they don't have a valid session.
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cc-offwhite flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-4xl font-playfair font-bold text-cc-maroon mb-2 text-center">New Password</h2>
        <p className="text-gray-500 text-center mb-8 font-semibold">Enter your new password below</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="New Password" 
              required 
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" 
              onChange={e => setPassword(e.target.value)} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm New Password" 
              required 
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-cc-maroon text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
