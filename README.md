# Fullstack POS (Point of Sale) Application

Aplikasi POS lengkap dengan fitur Kasir/Konsumen dan Dashboard Admin.

## Struktur Project
- `backend/`: Express.js, Prisma, SQLite, JWT Auth
- `frontend/`: React, Vite, Tailwind CSS, Lucide Icons

## Panduan Jalankan Lokal

### 1. Jalankan Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```
Backend berjalan di: `http://localhost:5000`

### 2. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:5173`
