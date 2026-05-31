import { BarChart3, TrendingUp, Users, Calendar, Activity } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-2">Campus Analytics</h1>
          <p className="text-gray-500">Platform-wide statistics and engagement metrics.</p>
        </div>
        <button className="bg-cc-maroon text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-opacity-90 transition">
          Export Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <span className="text-green-500 text-sm font-bold flex items-center gap-1"><TrendingUp size={14}/> +12%</span>
          </div>
          <div>
            <h3 className="text-gray-500 font-semibold text-sm">Total Active Students</h3>
            <p className="text-3xl font-bold text-cc-navy mt-1">4,289</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-cc-maroon rounded-xl">
              <Calendar size={24} />
            </div>
            <span className="text-green-500 text-sm font-bold flex items-center gap-1"><TrendingUp size={14}/> +5%</span>
          </div>
          <div>
            <h3 className="text-gray-500 font-semibold text-sm">Events Hosted (This Month)</h3>
            <p className="text-3xl font-bold text-cc-navy mt-1">142</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Activity size={24} />
            </div>
            <span className="text-green-500 text-sm font-bold flex items-center gap-1"><TrendingUp size={14}/> +22%</span>
          </div>
          <div>
            <h3 className="text-gray-500 font-semibold text-sm">Total Check-ins</h3>
            <p className="text-3xl font-bold text-cc-navy mt-1">12,593</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <span className="text-gray-400 text-sm font-bold flex items-center gap-1">- 2%</span>
          </div>
          <div>
            <h3 className="text-gray-500 font-semibold text-sm">Avg. Engagement Rate</h3>
            <p className="text-3xl font-bold text-cc-navy mt-1">68.4%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <h3 className="font-bold text-xl text-cc-navy mb-6">Attendance Trends (Last 7 Days)</h3>
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-semibold bg-gray-50">
            [Chart Area: Weekly Attendance Graph]
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <h3 className="font-bold text-xl text-cc-navy mb-6">Most Active Clubs</h3>
          <div className="space-y-4">
             {['Computer Science Society', 'Dance Club', 'Photography Association', 'Debate Team'].map((club, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-cc-navy text-white flex items-center justify-center font-bold text-sm">{i+1}</div>
                      <span className="font-bold text-gray-700">{club}</span>
                   </div>
                   <span className="font-semibold text-cc-maroon">{800 - (i * 150)} pts</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
