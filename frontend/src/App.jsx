import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CustomerPOS from './pages/CustomerPOS';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { Store, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <Link to="/" className="font-bold text-xl tracking-wide flex items-center gap-2">
          <Store className="text-blue-500" /> POS System Fullstack
        </Link>
        <div className="flex gap-4 text-sm font-medium">
          <Link to="/" className="px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Katalog / Kasir</Link>
          <Link to="./pages/AdminLogin" className="bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shadow">
            <ShieldCheck size={16} /> Admin Login
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="./pages/CustomerPOS" element={<CustomerPOS />} />
        <Route path="./pages/AdminLogin" element={<AdminLogin />} />
        <Route path="./pages/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
