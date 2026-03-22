import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const PageNotFound = () => {
  const Navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="absolute inset-0 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-800 mb-2">Uh-Oh!</h1>
        <p className="text-2xl font-semibold text-gray-600 mb-6">Page Doesn't Exist</p>

        <p className="text-gray-500 mb-8 leading-relaxed">
          It looks like the page you're looking for has wandered off. Don't worry, let's get you back on track!
        </p>

        <button
          onClick={() => Navigate('/')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
