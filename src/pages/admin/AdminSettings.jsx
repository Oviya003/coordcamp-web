import { Shield, Bell, Database, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  
  const handleSave = () => {
    toast.success("System settings updated successfully!");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-2">System Settings</h1>
        <p className="text-gray-500">Configure global platform parameters for the university.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-cc-navy flex items-center gap-2 border-b border-gray-100 pb-2">
            <Globe className="text-cc-maroon" size={24} /> General Configuration
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">University Name</label>
              <input type="text" defaultValue="State University" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Current Academic Term</label>
              <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold">
                <option>Fall 2026</option>
                <option>Spring 2027</option>
                <option>Summer 2027</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold text-cc-navy flex items-center gap-2 border-b border-gray-100 pb-2">
            <Shield className="text-cc-maroon" size={24} /> Security & Access
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div>
                <span className="block font-bold text-gray-800">Require '.edu' Email Addresses</span>
                <span className="text-sm text-gray-500">Only allow registrations from official university domains.</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-cc-maroon" />
            </label>
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div>
                <span className="block font-bold text-gray-800">Enforce 2FA for Admins</span>
                <span className="text-sm text-gray-500">Require two-factor authentication for university staff.</span>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-cc-maroon" />
            </label>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold text-cc-navy flex items-center gap-2 border-b border-gray-100 pb-2">
            <Database className="text-cc-maroon" size={24} /> Platform Features
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div>
                <span className="block font-bold text-gray-800">Enable AI Assistant</span>
                <span className="text-sm text-gray-500">Allow students and leaders to use the embedded AI chat.</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-cc-maroon" />
            </label>
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div>
                <span className="block font-bold text-gray-800">Allow Student-Created Events</span>
                <span className="text-sm text-gray-500">Let regular students propose grassroots events.</span>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-cc-maroon" />
            </label>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button onClick={handleSave} className="bg-cc-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-sm flex items-center gap-2">
            <Save size={18} /> Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
