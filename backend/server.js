const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretposkey_2026';

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE AUTH ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa.' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword }
    });
    res.json({ message: 'User berhasil dibuat', user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(400).json({ error: 'Username sudah digunakan' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(400).json({ error: 'User tidak ditemukan' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Password salah' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { username: user.username, role: user.role } });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, price, stock, category } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), stock: parseInt(stock), category }
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Gagal menambah produk' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ error: 'Gagal menghapus produk' });
  }
});

// --- ORDER ROUTES (POS) ---
app.post('/api/orders', async (req, res) => {
  const { items, totalPrice } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Keranjang belanja kosong' });

  try {
    const order = await prisma.order.create({
      data: {
        totalPrice: parseFloat(totalPrice),
        items: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price)
          }))
        }
      },
      include: { items: true }
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memproses pesanan' });
  }
});

app.get('/api/orders/stats', authenticateToken, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalSales = await prisma.order.aggregate({
      _sum: { totalPrice: true }
    });
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });

    res.json({
      totalOrders,
      totalRevenue: totalSales._sum.totalPrice || 0,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server POS Backend berjalan pada port ${PORT}`));
