import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, QrCode, Crosshair, Search, Loader2 } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Component to dynamically update map view when center changes
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null); // { lat, lng }
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    location: '', 
    radius_meters: 100,
    category: 'General',
    capacity: 100,
    credits: 10,
    attendance_mode: 'geofence'
  });

  // Default to a central location, but update it automatically
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); 

  // Auto-fetch location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          console.warn("Could not auto-fetch location", error);
        }
      );
    }
  }, []);

  const handleGetCurrentLocation = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.loading('Acquiring location...', { id: 'gps' });
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        toast.success('Location acquired!', { id: 'gps' });
      },
      (error) => {
        toast.error('Failed to get location. Please allow GPS access.', { id: 'gps' });
      }
    );
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setMapCenter([lat, lon]);
        setPosition({ lat, lng: lon });
        
        // Optionally update the location text input if it's empty
        if (!formData.location) {
          setFormData(prev => ({ ...prev, location: data[0].display_name.split(',')[0] }));
        }
        
        toast.success('Location found!');
      } else {
        toast.error('Location not found. Try a different search term.');
      }
    } catch (err) {
      toast.error('Error searching location: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (formData.attendance_mode === 'geofence' && !position) {
      toast.error('Please mark a location on the map for Geofencing.');
      return;
    }

    setLoading(true);
    try {
      // Use raw fetch to bypass Supabase SDK hanging bugs
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          latitude: formData.attendance_mode === 'geofence' ? position.lat : null,
          longitude: formData.attendance_mode === 'geofence' ? position.lng : null,
          radius_meters: formData.attendance_mode === 'geofence' ? formData.radius_meters : null,
          category: formData.category,
          capacity: formData.capacity,
          credits: formData.credits,
          attendance_mode: formData.attendance_mode,
          created_by: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || response.statusText);
      }
      
      toast.success('Event successfully created!');
      navigate('/leader/dashboard');
    } catch (err) {
      toast.error('Failed to create event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-playfair font-bold text-cc-maroon mb-2">Create New Event</h1>
      <p className="text-gray-500 font-semibold mb-6">Set up your event details and geofence boundary.</p>
      
      <div className="space-y-4">
        {/* Basic Details */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
          <input type="text" placeholder="e.g. Welcome Week Kickoff" required className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea placeholder="What is this event about?" rows="3" required className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Date & Time</label>
            <input type="datetime-local" required className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location Name</label>
            <input type="text" placeholder="e.g. Student Union" required className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
        </div>

        {/* Attendance Mode Selection */}
        <div className="bg-white p-6 rounded-2xl border-2 border-cc-maroon space-y-4">
          <h3 className="font-bold text-cc-navy text-lg border-b border-gray-100 pb-2">Attendance Tracking Method</h3>
          <p className="text-sm text-gray-500 font-semibold">Choose how students will check into this event.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setFormData({...formData, attendance_mode: 'geofence'})}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${formData.attendance_mode === 'geofence' ? 'border-cc-maroon bg-red-50 text-cc-maroon' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
            >
              <Crosshair size={32} className="mb-2" />
              <span className="font-bold text-lg">Geofence (GPS)</span>
              <span className="text-xs font-semibold mt-1 opacity-80 text-center">Students check-in automatically within a radius.</span>
            </button>

            <button 
              type="button"
              onClick={() => setFormData({...formData, attendance_mode: 'qr'})}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${formData.attendance_mode === 'qr' ? 'border-cc-maroon bg-red-50 text-cc-maroon' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
            >
              <QrCode size={32} className="mb-2" />
              <span className="font-bold text-lg">QR Code</span>
              <span className="text-xs font-semibold mt-1 opacity-80 text-center">Leader displays a QR Code for students to scan.</span>
            </button>
          </div>
        </div>

        {/* Geofence Settings (Conditional) */}
        {formData.attendance_mode === 'geofence' && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
            <div>
              <h3 className="font-bold text-cc-navy text-lg">Geofence Boundary</h3>
              <p className="text-sm text-gray-500 font-semibold">Search for a place, drop a pin, or use GPS.</p>
            </div>
            
            <button type="button" onClick={handleGetCurrentLocation} className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-bold text-cc-maroon hover:bg-red-50 transition shadow-sm whitespace-nowrap">
              <MapPin size={16} /> Use My Location
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search for a building, campus, or city..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-sm focus:border-cc-maroon focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSearchLocation(e); } }}
              />
            </div>
            <button 
              type="button" 
              onClick={handleSearchLocation}
              disabled={isSearching}
              className="bg-cc-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-sm flex items-center justify-center min-w-[100px] disabled:opacity-70"
            >
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
            </button>
          </div>
          
          <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-300">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Check-in Radius (meters)</label>
            <select className="w-full p-4 bg-white border border-gray-200 rounded-xl font-semibold" value={formData.radius_meters} onChange={e => setFormData({...formData, radius_meters: parseInt(e.target.value)})}>
              <option value="50">50 meters (Strict)</option>
              <option value="100">100 meters (Standard)</option>
              <option value="250">250 meters (Relaxed)</option>
              <option value="500">500 meters (Campus-wide)</option>
            </select>
          </div>
        </div>
        )}

        {/* Event Meta */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <select className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="General">General</option>
              <option value="Academic">Academic</option>
              <option value="Social">Social</option>
              <option value="Career">Career</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Capacity</label>
            <input type="number" min="1" required className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value === '' ? '' : parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Credits</label>
            <input type="number" min="0" required className="w-full p-4 bg-cc-offwhite border border-gray-200 rounded-xl" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value === '' ? '' : parseInt(e.target.value)})} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-cc-maroon hover:bg-opacity-90 transition text-white p-4 rounded-xl font-bold shadow-md mt-8 disabled:opacity-50 text-lg">
        {loading ? 'Publishing Event...' : 'Publish Event'}
      </button>
    </form>
  );
}