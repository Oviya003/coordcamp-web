import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, Loader2, User, Shield, Building, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { role: roleParam } = useParams();
  
  const roleConfig = {
    student: { title: 'Student Sign In', btnColor: 'bg-cc-maroon' },
    leader: { title: 'Club Leader Sign In', btnColor: 'bg-cc-gold' },
    admin: { title: 'University Admin Sign In', btnColor: 'bg-cc-navy' }
  };
  
  const currentConfig = roleConfig[roleParam] || roleConfig.student;
  
  // Map url param to db role
  const dbRoleMap = {
    'student': 'student',
    'leader': 'clubLeader',
    'admin': 'admin'
  };
  
  const targetRole = dbRoleMap[roleParam] || 'student';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Removed automatic redirects before role validation as requested

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1 & 2: Validate email/password and Authenticate
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout: Supabase is taking too long to respond. Please refresh the page or restart your dev server.")), 10000)
      );

      const { data, error: signInError } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        }),
        timeoutPromise
      ]);

      if (signInError) throw signInError;
      
      if (!data?.user) {
        throw new Error("Login succeeded but no user session was returned. If you just created this account, please check your email to verify your address before logging in.");
      }
      
      // Step 3: Fetch user profile from Supabase table
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Step 4: Determine actual role from database
      const finalRole = dbProfile?.role || 'student';
      
      console.log("LOGIN START");
      console.log("AUTH SUCCESS");
      console.log("PROFILE FETCH SUCCESS");
      console.log("ROLE FOUND:", finalRole);

      // Verify selected role is validated against database role
      if (targetRole !== finalRole) {
        // If they selected Admin but their role is student, reject.
        // Note: we sign them out so they aren't stuck in a half-logged-in state
        await supabase.auth.signOut();
        throw new Error(`Role mismatch: Your account is registered as '${finalRole}', but you are trying to log in as '${targetRole}'.`);
      }

      // Update local store with the DB truth
      useAuthStore.setState({ 
        user: { ...data.user, ...dbProfile, role: finalRole },
        token: data.session?.access_token,
        session: data.session
      });
      
      toast.success('Successfully logged in!');
      
      console.log("REDIRECTING TO", finalRole);
      
      // Navigate based on the database role
      if (finalRole === 'admin') navigate('/admin/dashboard');
      else if (finalRole === 'clubLeader' || finalRole === 'leader') navigate('/leader/dashboard');
      else navigate('/student/dashboard');

    } catch (err) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cc-offwhite flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="CoordCamp Logo" className="h-24 object-contain drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-playfair font-bold text-cc-maroon mb-2 text-center">{currentConfig.title}</h2>
        <p className="text-gray-500 text-center mb-8 font-semibold">Sign in to your CoordCamp account</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="email" placeholder="University Email" required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" required className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 bg-cc-offwhite focus:border-cc-maroon outline-none font-semibold" onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-cc-navy hover:text-cc-maroon font-semibold transition">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading} className={`w-full ${currentConfig.btnColor} text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg flex justify-center items-center`}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 font-semibold">
          New here? <Link to={`/register/${roleParam}`} className="text-cc-gold hover:underline font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}