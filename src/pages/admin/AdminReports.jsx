import { useState } from 'react';
import { supabase } from '../../config/supabase';
import { Download, FileText, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data to export.");
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} exported successfully!`);
  };

  const exportUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      downloadCSV(data, 'coordcamp_users_report.csv');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*, profiles(full_name)');
      if (error) throw error;
      
      const formatted = data.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        category: e.category,
        capacity: e.capacity,
        credits: e.credits,
        created_by_name: e.profiles?.full_name || 'Unknown'
      }));
      downloadCSV(formatted, 'coordcamp_events_report.csv');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportClubs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('clubs').select('*, profiles(full_name)');
      if (error) throw error;
      
      const formatted = data.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        leader: c.profiles?.full_name || 'Unknown',
        created_at: c.created_at
      }));
      downloadCSV(formatted, 'coordcamp_clubs_report.csv');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-2">Compliance & Reports</h1>
        <p className="text-gray-500">Generate and export system-wide data reports.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-cc-navy rounded-full flex items-center justify-center mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-xl font-bold text-cc-navy mb-2">User Directory</h2>
          <p className="text-sm text-gray-500 mb-6">Complete list of all registered students, leaders, and admins.</p>
          <button 
            onClick={exportUsers} 
            disabled={loading}
            className="w-full bg-cc-offwhite text-cc-navy border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition flex justify-center items-center gap-2 mt-auto"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-cc-maroon rounded-full flex items-center justify-center mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-xl font-bold text-cc-navy mb-2">Events Log</h2>
          <p className="text-sm text-gray-500 mb-6">All historical and upcoming events created across the platform.</p>
          <button 
            onClick={exportEvents} 
            disabled={loading}
            className="w-full bg-cc-offwhite text-cc-navy border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition flex justify-center items-center gap-2 mt-auto"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-50 text-cc-gold rounded-full flex items-center justify-center mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-xl font-bold text-cc-navy mb-2">Clubs Roster</h2>
          <p className="text-sm text-gray-500 mb-6">List of all active clubs and their designated faculty/student leaders.</p>
          <button 
            onClick={exportClubs} 
            disabled={loading}
            className="w-full bg-cc-offwhite text-cc-navy border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition flex justify-center items-center gap-2 mt-auto"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>
      
      {loading && (
         <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cc-maroon w-12 h-12 mb-4" />
            <p className="font-bold text-cc-navy">Generating Report...</p>
         </div>
      )}
    </div>
  );
}
