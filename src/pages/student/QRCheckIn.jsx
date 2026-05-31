import { useState } from 'react';
import { supabase } from '../../config/supabase';
import useAuthStore from '../../store/authStore';
import { Scanner } from '@yudiel/react-qr-scanner';
import toast from 'react-hot-toast';

export default function QRCheckIn() {
  const [status, setStatus] = useState('idle'); // idle | checking | success | error
  const [message, setMessage] = useState('Position the QR code within the frame to check in.');
  const { user } = useAuthStore();

  const handleScan = async (result) => {
    if (!result || status === 'checking' || status === 'success') return;
    const eventId = Array.isArray(result) ? result[0].rawValue : result;
    if (!eventId) return;

    setStatus('checking');
    setMessage('Verifying attendance...');
    
    try {
      // Basic UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(eventId)) {
        throw new Error("Invalid QR Code. Please scan a valid CoordCamp Event QR.");
      }

      const { error } = await supabase.from('attendance').insert({
        event_id: eventId,
        student_id: user.id,
        method: 'qr'
      });

      if (error) {
        if (error.code === '23505') throw new Error("You have already checked into this event!");
        if (error.code === '23503') throw new Error("This event does not exist.");
        throw error;
      }
      
      setStatus('success');
      setMessage('Successfully checked in!');
      toast.success('Attendance recorded!');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Check-in failed');
      toast.error(err.message || 'Check-in failed');
      setTimeout(() => {
        setStatus('idle');
        setMessage('Position the QR code within the frame to check in.');
      }, 4000);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-playfair font-bold text-cc-maroon">QR Check-in</h1>
      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <p className="mb-4 font-bold">{message}</p>
        <div className="rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border-4 border-cc-cream">
          {status === 'success' ? <div className="text-cc-green font-bold text-2xl">Checked In!</div> : (
            <Scanner onScan={handleScan} components={{ audio: false, finder: true }} />
          )}
        </div>
      </div>
    </div>
  );
}