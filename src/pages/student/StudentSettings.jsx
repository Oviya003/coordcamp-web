import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { User, Bell, Lock, Palette, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { usersService } from '../../services/usersService';
import toast from 'react-hot-toast';

export default function StudentSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const fullName = formData.get('fullName');
      
      if (fullName && fullName !== user?.full_name) {
        await usersService.updateProfile(user.id, { full_name: fullName });
        useAuthStore.setState(state => ({
          user: { ...state.user, full_name: fullName }
        }));
        toast.success('Profile updated successfully!');
      } else {
        toast.success('No changes to save.');
      }
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');
      
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Password updated successfully!');
      e.target.reset();
    } catch (err) {
      toast.error('Failed to update password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-2">Settings</h1>
      <p className="text-gray-500 font-semibold mb-8">Manage your account preferences and profile details.</p>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'profile' ? 'bg-cc-maroon text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <User size={18} /> Profile
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'notifications' ? 'bg-cc-maroon text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Bell size={18} /> Notifications
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'security' ? 'bg-cc-maroon text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Lock size={18} /> Security
          </button>
          <button onClick={() => setActiveTab('theme')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'theme' ? 'bg-cc-maroon text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Palette size={18} /> Appearance
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy border-b border-gray-100 pb-4 mb-6">Profile Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Full Name</label>
                  <input type="text" name="fullName" defaultValue={user?.full_name} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-cc-maroon focus:bg-white outline-none font-semibold transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Student ID</label>
                  <input type="text" defaultValue={user?.student_id} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-semibold cursor-not-allowed" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-600">Email Address</label>
                  <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-semibold cursor-not-allowed" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-600">Bio</label>
                  <textarea rows="3" placeholder="Tell us about your interests..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-cc-maroon focus:bg-white outline-none font-semibold transition"></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="bg-cc-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md flex items-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy border-b border-gray-100 pb-4 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                  <div>
                    <h4 className="font-bold text-cc-navy">Email Notifications</h4>
                    <p className="text-sm text-gray-500 font-medium">Receive updates about events and clubs via email.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-cc-maroon" />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                  <div>
                    <h4 className="font-bold text-cc-navy">Push Notifications</h4>
                    <p className="text-sm text-gray-500 font-medium">Get real-time alerts on your device.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-cc-maroon" />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                  <div>
                    <h4 className="font-bold text-cc-navy">Marketing & Promotions</h4>
                    <p className="text-sm text-gray-500 font-medium">Receive offers from campus partners.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-cc-maroon" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy border-b border-gray-100 pb-4 mb-6">Security Settings</h2>
              <p className="text-gray-500 font-semibold mb-4">Update your password to keep your account secure.</p>
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">New Password</label>
                  <input type="password" name="newPassword" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-cc-maroon focus:bg-white outline-none font-semibold transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Confirm New Password</label>
                  <input type="password" name="confirmPassword" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-cc-maroon focus:bg-white outline-none font-semibold transition" />
                </div>
                <button type="submit" disabled={loading} className="bg-cc-maroon text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md mt-4">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold text-cc-navy border-b border-gray-100 pb-4 mb-6">Appearance</h2>
              <p className="text-gray-500 font-semibold mb-4">Choose your preferred theme.</p>
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <button className="flex flex-col items-center gap-3 p-4 border-2 border-cc-maroon rounded-xl bg-cc-offwhite text-cc-navy font-bold">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200"></div>
                  Light Mode
                </button>
                <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-800 text-white font-bold opacity-50 cursor-not-allowed" title="Coming Soon">
                  <div className="w-12 h-12 bg-gray-900 rounded-full shadow-inner border border-gray-700"></div>
                  Dark Mode
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
