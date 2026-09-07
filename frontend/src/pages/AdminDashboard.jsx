import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, Plus, Trash2, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://lvxzdjbtsazgaffxdmmk.supabase.co/rest/v1/';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, recentOrders: [] });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '' });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axios.get(`${API_URL}/orders/stats`, authHeader);
      const prodRes = await axios.get(`${API_URL}/products`);
      setStats(statsRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      alert('Sesi telah berakhir atau akses ditolak. Silakan login kembali.');
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/products`, newProduct, authHeader);
      setNewProduct({ name: '', price: '', stock: '', category: '' });
      fetchDashboardData();
      alert('Produk berhasil ditambahkan!');
    } catch (err) {
      alert('Gagal menambah produk.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, authHeader);
      fetchDashboardData();
    } catch (err) {
      alert('Gagal menghapus produk.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manajemen Produk & Ringkasan Penjualan Store</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 font-medium hover:bg-red-100 transition">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
          <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><DollarSign size={32} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Pendapatan</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">Rp {stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><ShoppingBag size={32} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Transaksi</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalOrders} Transaksi</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Produk */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Plus size={20}/> Tambah Produk Baru</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">NAMA PRODUK</label>
              <input type="text" placeholder="Contoh: Es Kopi Susu" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">HARGA (RP)</label>
              <input type="number" placeholder="20000" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">STOK WAL</label>
              <input type="number" placeholder="50" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">KATEGORI</label>
              <input type="text" placeholder="Minuman / Makanan" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md mt-2">Simpan Produk</button>
          </form>
        </div>

        {/* Tabel Kelola Produk */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Package size={20}/> Manajemen Stok & Produk</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="p-3">Nama</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">Belum ada data produk.</td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{p.category}</span></td>
                    <td className="p-3 font-medium">Rp {p.price.toLocaleString()}</td>
                    <td className="p-3"><span className={`font-semibold ${p.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
