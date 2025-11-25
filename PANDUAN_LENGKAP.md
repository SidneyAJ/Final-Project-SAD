# Panduan Lengkap - Sistem Login & Registrasi Klinik Sentosa

## 📋 Ringkasan

Sistem login dan registrasi pasien untuk Klinik Sentosa dengan desain modern menggunakan color palette kesehatan dan background medis.

### Color Palette Baru

- **Baltic Blue** (#05668d) - Warna profesional untuk header
- **Teal** (#028090) - Warna utama untuk button dan link
- **Verdigris** (#00a896) - Warna gradient accent
- **Mint Leaf** (#02c39a) - Warna sukses dan highlight
- **Cream** (#f0f3bd) - Warna accent untuk border dan dekorasi

## 📁 Struktur File

```
klinik-sentosa/
├── index.html              # Halaman login
├── styles.css              # CSS untuk halaman login
├── script.js               # JavaScript untuk login
├── register.html           # Halaman registrasi pasien
├── register-styles.css     # CSS untuk halaman registrasi
├── register-script.js      # JavaScript untuk registrasi
├── README.md               # Dokumentasi login
└── PANDUAN_LENGKAP.md      # Dokumentasi ini
```

## 🎨 Fitur Desain

### Halaman Login
- ✅ Color palette kesehatan (teal, verdigris, mint leaf)
- ✅ Background gradient dengan pattern circle
- ✅ Dual-panel layout (branding + form)
- ✅ Role-based login (6 jenis pengguna)
- ✅ Password visibility toggle
- ✅ Remember me functionality
- ✅ Responsive untuk semua device

### Halaman Registrasi
- ✅ Healthcare-themed background dengan SVG medical icons
- ✅ Multi-step wizard form (3 langkah)
- ✅ Progress indicator interaktif
- ✅ Real-time validation
- ✅ Password strength meter
- ✅ Auto-formatting untuk NIK dan nomor HP
- ✅ Conditional fields (asuransi)

## 🚀 Cara Menggunakan

### 1. Login

Buka `index.html` di browser:

```bash
# Option 1: Double-click file index.html

# Option 2: Local server
python -m http.server 8000
# Buka: http://localhost:8000

# Option 3: VS Code Live Server
# Klik kanan index.html > Open with Live Server
```

**Demo Credentials:**

| Role | Username | Password |
|------|----------|----------|
| Pasien | pasien@demo.com | demo123 |
| Admin | admin@klinik.com | admin123 |
| Dokter | dokter@klinik.com | dokter123 |
| Perawat | perawat@klinik.com | perawat123 |
| Apoteker | apoteker@klinik.com | apoteker123 |
| Pemilik | pemilik@klinik.com | pemilik123 |

### 2. Registrasi Pasien

Klik "Daftar sebagai Pasien" dari halaman login atau buka `register.html`.

**Step 1: Data Diri**
- Nama lengkap (minimal 3 karakter)
- NIK (16 digit)
- Tanggal lahir
- Jenis kelamin
- Golongan darah (opsional)
- Alamat lengkap

**Step 2: Kontak**
- Nomor HP/WhatsApp (format: 08xxxx)
- Email (opsional)
- Kontak darurat (wajib)
- Informasi asuransi (opsional)

**Step 3: Akun**
- Username (minimal 4 karakter)
- Password (minimal 8 karakter, kekuatan dinilai otomatis)
- Konfirmasi password
- Persetujuan syarat & ketentuan

## 🔧 Konfigurasi Teknis

### Mengganti Color Scheme

Edit file CSS (`styles.css` atau `register-styles.css`):

```css
:root {
    --baltic-blue: #05668d;
    --teal: #028090;
    --verdigris: #00a896;
    --mint-leaf: #02c39a;
    --cream: #f0f3bd;
}
```

### Integrasi dengan Backend

#### Format Request - Login

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "role": "pasien",
  "username": "pasien@demo.com",
  "password": "demo123",
  "remember_me": true
}
```

#### Format Response - Login

```javascript
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "Ahmad Fauzi",
    "email": "pasien@demo.com",
    "role": "pasien"
  }
}
```

#### Format Request - Registrasi

```javascript
POST /api/auth/register
Content-Type: application/json

{
  "namaLengkap": "Ahmad Budiman",
  "nik": "1234567890123456",
  "tanggalLahir": "1990-05-15",
  "jenisKelamin": "laki-laki",
  "golonganDarah": "O",
  "alamat": "Jl. Kesehatan No. 123, RT 01/RW 02, Kelurahan Sentosa",
  "nomorHP": "08123456789",
  "email": "ahmad@email.com",
  "kontakDarurat": "Ibu Ani - 08987654321",
  "asuransi": "bpjs",
  "nomorAsuransi": "1234567890",
  "username": "ahmadbudiman",
  "password": "SecurePass123!",
  "role": "pasien"
}
```

#### Format Response - Registrasi

```javascript
{
  "success": true,
  "message": "Pendaftaran berhasil",
  "userId": "patient_123"
}
```

### Mengaktifkan Backend Real

Edit file `script.js` dan `register-script.js`, uncomment fungsi API yang sebenarnya:

```javascript
// Di script.js (baris ~160)
async function loginAPI(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    // ... rest of code
}

// Di register-script.js (baris ~380)
async function registerAPI(data) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    // ... rest of code
}
```

Ubah `API_BASE_URL` sesuai dengan backend Anda:

```javascript
const API_BASE_URL = 'https://your-api.com/api';
```

## 🎯 Validasi Form

### Login
- Role harus dipilih
- Username/email tidak boleh kosong
- Email harus format valid (jika menggunakan @)
- Password minimal 6 karakter

### Registrasi

**Step 1:**
- Nama lengkap minimal 3 karakter
- NIK harus 16 digit angka
- Tanggal lahir harus valid
- Jenis kelamin harus dipilih
- Alamat minimal 10 karakter

**Step 2:**
- Nomor HP format Indonesia (08xxx)
- Email format valid (jika diisi)
- Kontak darurat wajib diisi

**Step 3:**
- Username minimal 4 karakter (huruf, angka, underscore)
- Password minimal 8 karakter
- Password strength harus minimal "Sedang"
- Password dan konfirmasi harus sama
- Syarat & ketentuan harus disetujui

## 🎨 Customization

### Menambah Icon Medical pada Background

Edit `register-styles.css` bagian `.medical-icon`:

```css
.medical-icon.stethoscope-icon {
    width: 160px;
    height: 160px;
    top: 30%;
    right: 10%;
    background-image: url("data:image/svg+xml,...");
    animation-delay: 20s;
}
```

### Mengubah Jumlah Step Registrasi

1. Tambah HTML step baru di `register.html`
2. Tambah progress indicator
3. Update fungsi `validateStep()` di `register-script.js`
4. Tambah validasi khusus untuk step baru

### Menambah Role User Baru

1. **Update `index.html`:**
```html
<option value="role_baru">Role Baru</option>
```

2. **Update `script.js`:**
```javascript
const DASHBOARD_ROUTES = {
    // ...
    'role_baru': '/dashboard/role_baru'
};

const DEMO_USERS = {
    // ...
    'role_baru': { username: 'role@demo.com', password: 'demo123', name: 'User Baru' }
};
```

## 🔒 Security Features

### Implementasi Saat Ini

✅ Client-side validation
✅ Password strength checker
✅ Password visibility toggle
✅ CSRF protection ready (token-based)
✅ Input sanitization untuk NIK dan nomor HP
✅ Session management (localStorage/sessionStorage)
✅ Auto-logout on token expiration

### Rekomendasi untuk Production

⚠️ Tambahkan HTTPS only
⚠️ Implementasi rate limiting di backend
⚠️ Server-side validation (jangan hanya client-side)
⚠️ Password hashing dengan bcrypt/argon2
⚠️ Captcha untuk prevent bot
⚠️ Email verification
⚠️ Two-factor authentication (2FA)
⚠️ Audit logging semua aktivitas

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Login tidak berfungsi
- Pastikan JavaScript enabled
- Check console browser untuk error
- Verifikasi demo credentials

### Form registrasi tidak bisa next step
- Check validasi di console
- Pastikan semua field required terisi
- Verifikasi format input (NIK, HP, email)

### Background tidak muncul
- Check file CSS loaded dengan benar
- Verifikasi browser support untuk CSS gradients
- Clear cache browser

### Styling tidak sesuai
- Pastikan file CSS terhubung di HTML
- Check order file CSS (index atau register)
- Verifikasi CSS variables didefinisikan

## 📝 TODO & Enhancement Ideas

### Short-term
- [ ] Add loading skeleton saat page load
- [ ] Implement toast notifications yang lebih baik
- [ ] Add favicon untuk website
- [ ] Responsive testing di berbagai devices

### Medium-term
- [ ] Forgot password functionality
- [ ] Email verification
- [ ] Social login (Google, Facebook)
- [ ] Profile picture upload saat registrasi
- [ ] Lokasi berbasis GPS untuk alamat

### Long-term
- [ ] Two-factor authentication
- [ ] Biometric login (fingerprint face ID)
- [ ] Multi-language support (ID/EN)
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Progressive Web App (PWA)

## 👥 Authors

- **Watak, Darell Jonathan**
- **Legi, Sidney Alexander Junior**

**Course**: System Analysis and Design – B  
**Institution**: Fakultas Ilmu Komputer, Universitas Klabat  
**Date**: November 2025

## 📄 License

Copyright © 2025 Klinik Sentosa. All rights reserved.

---

**Catatan:** Sistem ini masih dalam mode development dengan mock authentication. Untuk production, pastikan semua security measures sudah diimplementasikan di backend.
