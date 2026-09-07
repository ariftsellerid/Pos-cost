import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Silakan periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] justify-center items-center bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Login Admin POS</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Masuk untuk mengelola produk dan stok toko Anda</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-600 mb-1">USERNAME</label>
          <div className="relative flex items-center">
            <User className="absolute left-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Masukkan Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full border pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" 
              required 
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-600 mb-1">PASSWORD</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="Masukkan Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full border pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" 
              required 
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          Masuk Dashboard
        </button>
      </form>
    </div>
  );
}
