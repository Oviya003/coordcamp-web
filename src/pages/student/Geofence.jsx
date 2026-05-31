import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { MapPin, CheckCircle, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Geofence() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Select an event and verify your location.');
  const [userLocation, setUserLocation] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date');
      if (data) {
        setEvents(data);
        if (data.length > 0) setSelectedEventId(data[0].id);
      }
    };
    fetchEvents();
  }, []);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleGeofenceCheckIn = () => {
    if (!selectedEvent?.latitude || !selectedEvent?.longitude) {
      toast.error("This event does not have a geofence configured.");
      return;
    }

    setStatus('locating'); 
    setMessage('Acquiring GPS coordinates...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: userLat, longitude: userLng } = position.coords;
        setUserLocation({ lat: userLat, lng: userLng });
        
        setStatus('checking');
        setMessage('Verifying distance...');
        
        const eventLat = selectedEvent.latitude;
        const eventLng = selectedEvent.longitude;
        const radius = selectedEvent.radius_meters || 100;
        
        const distance = calculateDistance(userLat, userLng, eventLat, eventLng);
        
        if (distance > radius) {
          setStatus('error');
          setMessage(`Check-in failed. You are ${Math.round(distance)}m away (max ${radius}m).`);
          toast.error("You are not in the venue");
          return;
        }

        try {
          const { error } = await supabase.from('attendance').insert({
            event_id: selectedEventId,
            student_id: user.id,
            method: 'geofence',
            status: 'present'
          });

          if (error && error.code !== '23505') {
            throw error;
          }
          
          setStatus('success'); 
          setMessage('Attendance marked successfully');
          toast.success('Attendance marked successfully');
          
          // Start continuous tracking
          startTracking(selectedEvent, userLat, userLng);
        } catch (err) {
          setStatus('error'); 
          setMessage(err.message || 'Check-in failed');
        }
      },
      (error) => { 
        setStatus('error'); 
        setMessage(error.message === 'User denied Geolocation' ? 'Please allow location access in your browser settings.' : 'Failed to get location.'); 
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  function startTracking(event, initialLat, initialLng) {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(async (position) => {
      const { latitude: userLat, longitude: userLng } = position.coords;
      setUserLocation({ lat: userLat, lng: userLng });
      
      const distance = calculateDistance(userLat, userLng, event.latitude, event.longitude);
      const radius = event.radius_meters || 100;
      
      if (distance > radius) {
        toast.error("You have left the venue! Attendance updated.");
        setStatus('error');
        setMessage("You are not in the venue.");
        
        // Update database to mark as left
        await supabase.from('attendance')
          .update({ status: 'left' })
          .eq('event_id', event.id)
          .eq('student_id', user.id);
          
        navigator.geolocation.clearWatch(watchId);
      }
    }, 
    (err) => console.log("Tracking error:", err),
    { enableHighAccuracy: true });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-playfair font-bold text-cc-maroon mb-2">Geofence Check-in</h1>
        <p className="text-gray-500 font-semibold">Your location must be within the event radius.</p>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        
        <select className="w-full p-4 rounded-xl border border-gray-300 bg-cc-offwhite mb-6 font-bold" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
          {events.length === 0 && <option value="">No upcoming events available</option>}
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        {selectedEvent?.latitude && (
          <div className="h-48 w-full rounded-2xl overflow-hidden mb-6 border border-gray-200 z-0 relative">
            <MapContainer center={[selectedEvent.latitude, selectedEvent.longitude]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[selectedEvent.latitude, selectedEvent.longitude]} />
              <Circle center={[selectedEvent.latitude, selectedEvent.longitude]} radius={selectedEvent.radius_meters || 100} pathOptions={{ color: '#8B1A1A', fillColor: '#8B1A1A', fillOpacity: 0.2 }} />
              
              {/* Show user location if captured */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({ className: 'bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-md' })} />
              )}
            </MapContainer>
          </div>
        )}

        {!selectedEvent?.latitude && selectedEvent && (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl mb-6 font-bold text-center">
            This event does not have a GPS location configured.
          </div>
        )}

        <div className={`p-4 rounded-xl mb-6 font-bold text-center flex items-center justify-center gap-3 ${status === 'error' ? 'bg-red-50 text-red-600' : status === 'success' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
          {status === 'locating' || status === 'checking' ? <Loader2 className="animate-spin" /> : null}
          {message}
        </div>

        <button 
          onClick={handleGeofenceCheckIn} 
          disabled={status === 'locating' || status === 'checking' || !selectedEvent?.latitude || status === 'success'} 
          className="w-full bg-cc-maroon hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          <MapPin size={24} /> Verify My Location
        </button>
      </div>
    </div>
  );
}