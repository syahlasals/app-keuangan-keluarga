# 📄 Product Requirement Document (PRD)

**Aplikasi PWA Keuangan Keluarga**

## 1. Tujuan Produk

Aplikasi ini bertujuan untuk membantu keluarga mencatat pemasukan dan pengeluaran secara sederhana, berbasis web dengan PWA sehingga bisa diakses lewat mobile browser maupun laptop. Fokus utama adalah kemudahan pencatatan transaksi sehari-hari dan transparansi antar anggota keluarga.

---

## 2. Target Pengguna

* Keluarga atau individu yang ingin melacak pemasukan & pengeluaran tanpa kompleksitas aplikasi e-wallet.
* User dengan perangkat mobile (utama), laptop/desktop (opsional).

---

## 3. Fitur Utama

### 3.1 Autentikasi

* Registrasi: Menggunakan email & password.
* Login: Menggunakan email & password.
* Reset Password: Fungsi reset password melalui email (menggunakan fitur default dari Supabase).
* Logout: Keluar dari sesi aktif.
* Login di beberapa perangkat secara bersamaan diizinkan.
* Manajemen Profil: Pengguna dapat mengedit informasi profil mereka.

### 3.2 Manajemen Transaksi

* CRUD transaksi: pemasukan & pengeluaran.

* Atribut transaksi:

  * Nominal: Angka (integer), dalam format Rupiah.
  * Tanggal: (backdate diperbolehkan, tanpa jam).
  * Kategori: Hanya untuk pengeluaran. Untuk pemasukan tidak perlu kategori.
  * Catatan: Teks opsional untuk detail tambahan.
  * Riwayat Transaksi: Default ditampilkan berurutan dari yang terbaru (descending). Dilengkapi infinite scroll dan tombol "Scroll to Top".
  * Satu transaksi = satu kategori (jika diperlukan).

* Pencarian & Filter:
  * Search: Search transaksi berdasarkan kata kunci (catatan/kategori).
  * Filter: Filter transaksi berdasarkan kategori & rentang waktu.

* Tampilan Detail Transaksi: Pengguna harus mengklik transaksi untuk melihat detail sebelum dapat mengedit atau menghapus.

### 3.3 Saldo

* Perhitungan Saldo: Saldo total dihitung secara dinamis dari (Total Pemasukan - Total Pengeluaran).
* Saldo Awal: Tidak ada kolom saldo awal statis. Untuk mengatur saldo awal, pengguna cukup menambahkan transaksi pemasukan dengan catatan "Saldo Awal" (default saldo 0).
* Privasi Saldo: Pengguna dapat menyembunyikan saldo dengan ikon mata pada halaman dashboard dan profil.

### 3.4 Kategori

* Default kategori: Makanan, Transportasi, Pendidikan, Hiburan, Rumah Tangga. Input berupa dropdown + opsi "Tambah kategori baru".
* Manajemen Kategori: Pengguna dapat menambah, mengubah, atau menghapus kategori.
* Penghapusan Kategori: Jika sebuah kategori dihapus, semua transaksi yang terkait akan dipindahkan ke kategori "Tanpa Kategori".
* Kategori hanya digunakan untuk transaksi pengeluaran, tidak untuk pemasukan.

### 3.5 Sinkronisasi & Status

* Sinkronisasi Offline: 
  * Eventual sync ke backend (Supabase).
  * Data pending Transaksi yang dibuat saat offline akan disimpan otomatis di IndexedDB.
  * Transaksi pending: Sinkronisasi ke backend (Supabase) akan dicoba kembali secara otomatis di latar belakang saat koneksi internet pulih, tidak perlu tombol manual.
* Indikator status transaksi: Pending / Success.
* Konflik data → last write wins.

### 3.6 Dashboard

* Ringkasan total saldo berjalan.
* Ringkasan total pemasukan & pengeluaran bulan berjalan.
* Grafik sederhana (line/bar chart) pemasukan vs pengeluaran bulan berjalan. Menampilkan pemasukan/pengeluaran harian dalam 1 bulan (sumbu X = tanggal).
* Fitur privasi saldo dengan tombol toggle mata untuk menyembunyikan/menampilkan nominal saldo.

### 3.7 UI/UX

* Mobile-first, responsif untuk laptop/desktop.
* Bottom navigation: Dashboard / Transaksi / Profil (logout).
* Card sederhana untuk menampilkan transaksi (Nominal, Kategori, Catatan).
* UI style: modern clean dengan nuansa hijau/biru finance dengan efek glassmorphism.
* Pengalaman pengguna yang ditingkatkan dengan tampilan detail transaksi sebelum mengedit atau menghapus.
* Bahasa: Indonesia.
* Format uang: titik pemisah ribuan (`Rp 10.000`).

---

## 4. Non-Fitur (Out of Scope)

* Tidak ada ekspor data (CSV/PDF/Excel) untuk saat ini.
* Tidak ada upload nota.
* Tidak ada notifikasi reminder.
* Tidak ada dark mode.
* Tidak ada reset data massal.
* Tidak ada role admin/member (semua user setara).

---

## 5. Arsitektur Teknis

### 5.1 Frontend

* Framework: Next.js (React) untuk mendukung PWA, SEO-friendly, server-side rendering untuk web.
* Styling: Tailwind CSS.
* State management: Zustand.
* Chart: Recharts.

### 5.2 Backend

Backend as a Service (BaaS): Supabase.

* **Supabase**:

  * Authentication: Registrasi & login dengan email + password. Reset password via email.
  * Database: Hosting database PostgreSQL.
  * API: API otomatis untuk interaksi dengan database.
  * Hosting: Vercel (Frontend), Supabase (Backend & Database).

### 5.3 Database (struktur awal)

#### Tabel `users`

* `id` (UUID, PK)
* `email` (string, unique)
* `nama` (string, nullable)
* `created_at` (timestamp)
* `updated_at` (timestamp)

#### Tabel `categories`

* `id` (UUID, PK)
* `user_id` (FK → users.id)
* `nama` (string)
* Default: makanan, transportasi, pendidikan, hiburan, rumah tangga.

#### Tabel `transactions`

* `id` (UUID, PK)
* `user_id` (FK → users.id)
* `kategori_id` (FK → categories.id, nullable → "Tanpa Kategori")
* `nominal` (integer)
* `tipe` (enum: pemasukan/pengeluaran)
* `tanggal` (date)
* `catatan` (string, nullable)
* `status` (enum: pending/success)

---

## 6. User Flow

1. **Registrasi** → input email & password → redirect ke login.
2. **Login** → masuk dashboard.
3. **Dashboard** → Pengguna melihat ringkasan saldo, pemasukan/pengeluaran bulan ini, dan grafik harian.
4. **Tambah transaksi** → pilih tipe (pemasukan/pengeluaran), nominal, kategori (hanya untuk pengeluaran), tanggal, catatan → simpan → tampil di history.
5. **History transaksi** → default descending, infinite scroll, filter kategori/rentang waktu, search.
6. **Lihat detail transaksi** → klik pada transaksi untuk melihat detail lengkap sebelum mengedit atau menghapus.
7. **Edit profil** → akses dari halaman profil untuk mengubah nama pengguna.
8. **Logout** dari menu profil.

---

## 7. Roadmap Fase Selanjutnya

* Fase 2:

  * Ekspor laporan (CSV/PDF).
  * Perbandingan growth antar bulan.
  * Multi-akun dalam 1 keluarga.
  * Role admin/member.
  * Soft delete (riwayat penghapusan).
  * Multi bahasa.

* Fase 3:

  * Backup otomatis.
  * Visualisasi grafik kategori (pie chart).
  * Integrasi dengan pembayaran/metode input otomatis (opsional).