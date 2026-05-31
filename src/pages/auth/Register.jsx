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
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          student_id: formData.studentId,
        }
      }
    });

    if (signUpError) {
      setError("Registration Error: " + signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Force an update to override the SQL trigger's default 'student' role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', data.user.id);
        
      if (profileError) {
        console.error("Error setting role on register:", profileError);
      }
    }

    toast.success('Account created successfully!');
    
    // Bypass verification email locally so user isn't stuck
    if (data?.user) {
      useAuthStore.setState({ 
        user: { ...data.user, role: targetRole },
        token: data.session?.access_token || 'mock-token',
        session: data.session || { access_token: 'mock-token' }
      });
      
      if (targetRole === 'admin') navigate('/admin/dashboard');
      else if (targetRole === 'clubLeader' || targetRole === 'leader') navigate('/leader/dashboard');
      else navigate('/student/dashboard');
    }
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