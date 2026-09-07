import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://lvxzdjbtsazgaffxdmmk.supabase.co/rest/v1/';

export default function CustomerPOS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar produk', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert('Stok tidak mencukupi!');
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.quantity + delta;
        if (delta > 0 && product && newQty > product.stock) {
          alert('Stok terbatas!');
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang belanja masih kosong!');
    try {
      await axios.post(`${API_URL}/orders`, { items: cart, totalPrice: total });
      alert('Transaksi Berhasil! Terima kasih atas pembelian Anda.');
      setCart([]);
      fetchProducts();
    } catch (err) {
      alert('Gagal memproses transaksi.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
      {/* Katalog Produk */}
      <div className="w-full md:w-2/3 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Menu & Katalog Produk POS</h1>
          <button onClick={fetchProducts} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm text-sm hover:bg-gray-50">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat katalog...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm border">Belum ada produk tersedia. Silakan hubungi admin untuk menambah stok.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">{p.category}</span>
                  <h3 className="font-bold text-lg mt-2 text-gray-800">{p.name}</h3>
                  <p className="text-gray-500 text-sm">Stok Tersedia: <span className="font-semibold text-gray-700">{p.stock}</span></p>
                </div>
                <div className="mt-4 flex justify-between items-center border-t pt-3">
                  <span className="font-bold text-blue-600 text-lg">Rp {p.price.toLocaleString()}</span>
                  <button 
                    onClick={() => addToCart(p)}
                    disabled={p.stock <= 0}
                    className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium text-sm">
                    <Plus size={18} /> Tambah
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Panel */}
      <div className="w-full md:w-1/3 bg-white border-l p-6 flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <ShoppingCart className="text-blue-600" />
            <h2 className="text-xl font-bold">Keranjang Belanja</h2>
          </div>

          <div className="space-y-3 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <div className="text-gray-400 text-center py-12">Keranjang belanja masih kosong</div>
            ) : cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-500">Rp {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-gray-200 hover:bg-gray-300 rounded"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-gray-200 hover:bg-gray-300 rounded"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:text-red-700 ml-2"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold">Total Pembayaran</span>
            <span className="text-2xl font-bold text-blue-600">Rp {total.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 disabled:bg-gray-300 transition shadow">
            <CreditCard size={20} /> Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
