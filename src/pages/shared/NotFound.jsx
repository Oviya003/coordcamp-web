import { Link, useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cc-offwhite flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl w-full max-w-lg text-center border border-gray-100">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <SearchX className="w-full h-full text-gray-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-cc-maroon font-playfair">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-playfair font-bold text-cc-navy mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8 font-semibold">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition"
          >
            <ArrowLeft className="mr-2" size={18} /> Go Back
          </button>
          <Link 
            to="/" 
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-cc-maroon text-white rounded-xl hover:bg-opacity-90 font-bold transition shadow-md"
          >
            <Home className="mr-2" size={18} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
