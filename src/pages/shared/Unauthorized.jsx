import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-cc-offwhite flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl w-full max-w-lg text-center border border-gray-100">
        <ShieldAlert className="w-24 h-24 text-cc-maroon mx-auto mb-6 opacity-80" />
        <h1 className="text-4xl font-playfair font-bold text-cc-navy mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-8 font-semibold text-lg">
          You don't have permission to view this page. Please log in with an appropriate account.
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center justify-center px-8 py-4 bg-cc-navy text-white rounded-xl hover:bg-opacity-90 font-bold transition shadow-lg w-full"
        >
          <ArrowLeft className="mr-2" size={20} /> Return to Login
        </Link>
      </div>
    </div>
  );
}
