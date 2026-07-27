import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Lock, Hash, Loader2, Shield, Building, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { role: roleParam } = useParams();
  
  const roleConfig = {
    student: { title: 'Student Registration', btnColor: 'bg-cc-maroon' },
    leader: { title: 'Club Leader Registration', btnColor: 'bg-cc-gold' },
    admin: { title: 'University Admin Registration', btnColor: 'bg-cc-navy' }
  };
  
  const currentConfig = roleConfig[roleParam] || roleConfig.student;
  
  // Map url param to db role
  const dbRoleMap = {
    'student': 'student',
    'leader': 'clubLeader',
    'admin': 'admin'
  };
  
  const targetRole = dbRoleMap[roleParam] || 'student';

  const [formData, setFormData] = useState({ name: '', email: '', password: '', studentId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Removed automatic redirects before role validation as requested

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter and one number');
      setLoading(false);
      return;
    }
    let data = null;
    let authData = null;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmchgoheciwkitiamihv.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptY2hnb2hlY2l3a2l0aWFtaWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDU5MzUsImV4cCI6MjA5NTUyMTkzNX0.Rt7gfIVturJnppXrgNbova7mGLxAqmadwlsYWYDuYfg';
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout: Supabase is taking too long to respond.")), 10000)
      );

      // STEP 1: Sign up the user
      const signUpResponse = await Promise.race([
        fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: 'POST',
          headers: { 'apikey': anonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            data: { full_name: formData.name, student_id: formData.studentId, role: targetRole }
          })
        }),
        timeoutPromise
      ]);

      if (!signUpResponse.ok) {
        const errorData = await signUpResponse.json();
        throw new Error(errorData.msg || errorData.error_description || 'Registration Failed');
      }
      data = await signUpResponse.json();

      // STEP 2: Log them in instantly to get an access token
      const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      if (!loginResponse.ok) throw new Error("Could not log in after registration");
      authData = await loginResponse.json();

      // STEP 3: Forcefully fix the broken Postgres trigger by patching their role using their new token
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${authData.user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: targetRole })
      });

      // STEP 4: Save session locally so it survives a refresh
      const sessionData = {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
        expires_at: Math.floor(Date.now() / 1000) + authData.expires_in,
        token_type: authData.token_type,
        user: authData.user
      };
      localStorage.setItem('sb-zmchgoheciwkitiamihv-auth-token', JSON.stringify(sessionData));

    } catch (err) {
      setError("Registration Error: " + err.message);
      setLoading(false);
      return;
    }

    toast.success('Account created successfully!');
    
    // Update global store and navigate!
    useAuthStore.setState({ 
      user: { ...authData.user, role: targetRole, full_name: formData.name },
      token: authData.access_token,
      session: authData,
      isInitialized: true
    });
    
    if (targetRole === 'admin') navigate('/admin/dashboard');
    else if (targetRole === 'clubLeader' || targetRole === 'leader') navigate('/leader/dashboard');
    else navigate('/student/dashboard');
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cc-offwhite flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 mt-10 mb-10">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="CoordCamp Logo" className="h-24 object-contain drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-playfair font-bold text-cc-maroon mb-2 text-center">{currentConfig.title}</h2>
        <p className="text-gray-500 text-center mb-8 font-semibold">Join the university portal</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="email" placeholder="University Email" required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Student ID" required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" onChange={e => setFormData({...formData, studentId: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" required className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className={`w-full ${currentConfig.btnColor} text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg mt-2 flex justify-center items-center`}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 font-semibold">
          Already have an account? <Link to={`/login/${roleParam}`} className="text-cc-gold hover:underline font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}