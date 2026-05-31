import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (resetError) throw resetError;
      
      setSuccess(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cc-offwhite flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-cc-maroon font-semibold mb-6 transition">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>
        
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="CoordCamp Logo" className="h-24 object-contain drop-shadow-md" />
        </div>
        <h2 className="text-4xl font-playfair font-bold text-cc-maroon mb-2 text-center">Reset Password</h2>
        <p className="text-gray-500 text-center mb-8 font-semibold">We'll send you a link to reset your password</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}

        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <CheckCircle size={48} className="text-green-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Check your inbox</h3>
            <p className="text-sm font-semibold">We have sent a password reset link to {email}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                placeholder="University Email" 
                required 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-cc-maroon text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg flex justify-center items-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
