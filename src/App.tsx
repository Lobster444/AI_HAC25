import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchDetailsPage from './components/MatchDetailsPage';
import AdminPage from './components/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {/* Mobile Frame */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 relative">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
          
          {/* Screen Content */}
          <div className="relative">
            <Routes>
              <Route path="/" element={<MatchDetailsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;