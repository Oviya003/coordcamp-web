import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Search, Users, Tag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await supabase.from('clubs').select('*').order('name');
        if (error) throw error;
        setClubs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-6">Discover Clubs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clubs.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">No clubs found.</p>
        ) : (
          clubs.map(club => (
            <div key={club.id} className="bg-white rounded-2xl shadow border border-gray-100 flex flex-col overflow-hidden hover:shadow-lg transition">
              <div className="h-24 bg-cc-teal p-6 flex items-end">
                <h3 className="text-xl font-bold text-white line-clamp-1">{club.name}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-xs bg-teal-50 text-cc-teal px-2 py-1 rounded-full font-bold mb-3 w-fit border border-teal-100">
                  {club.category || 'General'}
                </span>
                <p className="text-gray-600 mb-6 line-clamp-2 text-sm flex-1">{club.description}</p>
                <Link to={`/student/clubs/${club.id}`} className="mt-auto text-center w-full bg-cc-offwhite text-cc-teal border border-cc-teal/20 font-bold py-2 rounded-lg hover:bg-teal-50 transition">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}