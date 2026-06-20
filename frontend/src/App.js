import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

const MenuPlaceholder = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-4xl font-bold text-nibmBlue">Menu Page</h1>
    <p className="text-gray-600 mt-4 text-xl">Successfully Logged In! Product Catalog coming soon.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<MenuPlaceholder />} />
      </Routes>
    </Router>
  );
}

export default App;