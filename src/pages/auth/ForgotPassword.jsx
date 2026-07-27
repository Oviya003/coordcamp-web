import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (verifyError) throw verifyError;
      
      toast.success('OTP verified! Please set your new password.');
      navigate('/reset-password');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
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
        <p className="text-gray-500 text-center mb-8 font-semibold">
          {otpSent ? "Enter the 6-digit OTP sent to your email" : "We'll send you an OTP to reset your password"}
        </p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}

        {otpSent ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="6-digit OTP" 
                required 
                maxLength={6}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold text-center tracking-widest text-lg" 
                onChange={e => setOtp(e.target.value)} 
                value={otp}
              />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-cc-maroon text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg flex justify-center items-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
            </button>
            <div className="text-center">
               <button type="button" onClick={handleSendOtp} className="text-sm text-cc-navy hover:text-cc-maroon font-bold transition">Resend OTP</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                placeholder="University Email" 
                required 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" 
                onChange={e => setEmail(e.target.value)} 
                value={email}
              />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-cc-maroon text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg flex justify-center items-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
