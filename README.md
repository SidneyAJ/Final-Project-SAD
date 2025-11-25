# Klinik Sentosa - Sistem Manajemen Klinik Terpadu

Aplikasi manajemen klinik komprehensif yang dibangun dengan React (Frontend) dan Node.js/Express (Backend) dengan database MySQL. Aplikasi ini mencakup fitur untuk berbagai role pengguna termasuk Pasien, Dokter, Apoteker, Admin, dan Pemilik Klinik.

## 🚀 Fitur Utama

*   **Pasien**: Pendaftaran online, pengambilan antrean, melihat riwayat medis, notifikasi status antrean.
*   **Dokter**: Dashboard dokter, manajemen antrean pasien, input rekam medis (diagnosis & tindakan), resep obat terintegrasi inventory.
*   **Apoteker**: Manajemen stok obat, verifikasi resep dari dokter, dispensing obat.
*   **Admin**: Manajemen pengguna, pengaturan klinik, monitoring aktivitas.
*   **Owner**: Dashboard eksekutif, laporan keuangan, laporan aktivitas klinik.

## 🛠️ Teknologi yang Digunakan

*   **Frontend**: React.js, Tailwind CSS, Lucide React Icons.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL.
*   **Authentication**: JWT (JSON Web Tokens).

## 📋 Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (v14 atau lebih baru)
*   [MySQL](https://www.mysql.com/)

## ⚙️ Cara Instalasi & Menjalankan

### 1. Setup Database

1.  Buat database baru di MySQL bernama `klinik_sentosa`.
2.  Import file SQL database (jika ada) atau biarkan backend membuat tabel secara otomatis saat dijalankan (pastikan konfigurasi database di backend sesuai).

### 2. Setup Backend

1.  Masuk ke folder backend:
    ```bash
    cd backend
    ```
2.  Instal dependencies:
    ```bash
    npm install
    ```
3.  Konfigurasi Database:
    Buka file `database.js` atau `.env` (jika ada) dan sesuaikan konfigurasi koneksi database Anda (host, user, password, database name).
    *Default config di `database.js`: host: 'localhost', user: 'root', password: '', database: 'klinik_sentosa'*
4.  Jalankan server backend:
    ```bash
    npm start
    ```
    Server akan berjalan di `http://localhost:3000`.

### 3. Setup Frontend

1.  Buka terminal baru dan masuk ke folder frontend:
    ```bash
    cd klinik-sentosa-react
    ```
2.  Instal dependencies:
    ```bash
    npm install
    ```
3.  Jalankan aplikasi frontend:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:5173` (atau port lain yang tersedia).

## 🔑 Akun Demo (User Credentials)

Berikut adalah daftar akun untuk pengujian setiap role:

| Role | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@email.com` | `password123` | Akses penuh sistem & manajemen user |
| **Dokter** | `Steven@email.com` | `password123` | Dashboard dokter, periksa pasien |
| **Apoteker** | `pharmacist@test.com` | `password123` | Verifikasi resep, stok obat |
| **Owner** | `owner@klinik.com` | `password123` | Laporan keuangan & aktivitas |
| **Pasien** | `Sidney@email.com` | `password123` | Akun pasien (Username: nior) |
| **Pasien** | `derel@email.com` | `password123` | Akun pasien (Username: Derel) |
| **Pasien** | `newpatient@test.com` | `password123` | Akun pasien baru |

## 📝 Catatan Penting

*   **Sistem Antrean**: Antrean bersifat real-time. Pastikan backend berjalan agar status antrean terupdate.
*   **Sistem Farmasi**: Obat yang diresepkan dokter akan mengurangi stok di inventory apoteker setelah diverifikasi dan didispense.
*   **Timezone**: Sistem menggunakan waktu lokal server.

---
*Dibuat untuk Final Project Klinik Sentosa*
