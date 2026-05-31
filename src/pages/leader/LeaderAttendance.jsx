import { motion } from 'framer-motion';
import { BarChart2, CheckCircle, Clock, Users } from 'lucide-react';

export default function LeaderAttendance() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Attendance Analytics</h1>
        <p className="text-cc-navy text-lg">Monitor geofence and QR check-in data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600"><CheckCircle size={32} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Avg Attendance</p>
            <h2 className="text-3xl font-playfair font-bold text-gray-800">85%</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-50 p-4 rounded-2xl text-cc-navy"><Users size={32} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Total Scans</p>
            <h2 className="text-3xl font-playfair font-bold text-gray-800">1,240</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-yellow-50 p-4 rounded-2xl text-cc-gold"><Clock size={32} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">On-Time Rate</p>
            <h2 className="text-3xl font-playfair font-bold text-gray-800">92%</h2>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-playfair font-bold text-cc-navy flex items-center gap-2">
            <BarChart2 size={24} className="text-cc-gold" /> Attendance Trends
          </h2>
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-600 outline-none">
            <option>Last 30 Days</option>
            <option>This Semester</option>
            <option>All Time</option>
          </select>
        </div>
        
        {/* CSS Mock Chart */}
        <div className="h-64 flex items-end gap-2 px-4 border-b-2 border-l-2 border-gray-100 pb-2">
          {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95].map((height, i) => (
            <div key={i} className="flex-1 bg-cc-maroon rounded-t-md hover:bg-cc-gold transition-colors relative group" style={{ height: `${height}%` }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                {height}%
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 px-4 uppercase">
          <span>Sep 1</span>
          <span>Sep 15</span>
          <span>Oct 1</span>
          <span>Oct 15</span>
          <span>Nov 1</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-cc-navy">Recent Check-ins</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold text-cc-navy">Fall Kickoff Meeting</p>
                  <p className="text-sm text-gray-500">Alice Smith checked in via Geofence</p>
                </div>
                <span className="text-xs font-bold text-gray-400">10 mins ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
