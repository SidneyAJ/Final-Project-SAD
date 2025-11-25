# 🔧 PERBAIKAN FITUR REGISTRASI

## ❌ MASALAH YANG DITEMUKAN

### 1. **HTML Form Tidak Lengkap**
- ❌ Step 2 (Data Kontak) HILANG dari register.html
- File HTML loncat dari Step 1 langsung ke Step 3
- Missing fields:
  - Email
  - Nomor HP (nomorHP)
  - Alamat (alamat)
  - Kontak Darurat (kontakDarurat)
  - Golongan Darah (golonganDarah)

### 2. **Backend Tidak Handle NIK**
- Backend auth.js tidak menerima field NIK
- NIK hilang saat save ke database

### 3. **Form Validation**
- Step 2 validation tidak ada karena step 2 hilang

---

## ✅ SOLUSI

### Step 1: Tambah Step 2 ke HTML
Tambahkan section Step 2 (Data Kontak) di register.html setelah Step 1:

```html
<!-- Step 2: Data Kontak -->
<div class="form-step" id="step2">
    <h2 class="step-title">Informasi Kontak</h2>
    
    <!-- Email -->
    <div class="form-group">
        <label for="email">Email <span class="required">*</span></label>
        <input type="email" id="email" name="email" required>
    </div>
    
    <!-- Nomor HP -->
    <div class="form-group">
        <label for="nomorHP">Nomor HP <span class="required">*</span></label>
        <input type="tel" id="nomorHP" name="nomorHP" required>
    </div>
    
    <!-- Alamat -->
    <div class="form-group">
        <label for="alamat">Alamat Lengkap <span class="required">*</span></label>
        <textarea id="alamat" name="alamat" rows="3" required></textarea>
    </div>
    
    <!-- Kontak Darurat -->
    <div class="form-group">
        <label for="kontakDarurat">Kontak Darurat <span class="required">*</span></label>
        <input type="text" id="kontakDarurat" name="kontakDarurat" required>
    </div>
    
    <!-- Golongan Darah -->
    <div class="form-group">
        <label for="golonganDarah">Golongan Darah</label>
        <select id="golonganDarah" name="golonganDarah">
            <option value="">Pilih...</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
        </select>
    </div>
    
    <!-- Navigation -->
    <div class="form-navigation">
        <button type="button" onclick="previousStep(1)">Kembali</button>
        <button type="button" onclick="nextStep(3)">Selanjutnya</button>
    </div>
</div>
```

### Step 2: Update Backend auth.js
Tambahkan field NIK ke backend:

```javascript
router.post('/register', async (req, res) => {
    const { email, password, role, name, nik, date_of_birth, gender, phone, address, blood_type } = req.body;
    
    if (!email || !password || !role || !name) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    
    try {
        // Check email exists
        db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ error: 'Email sudah terdaftar' });
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user
            db.run("INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)",
                [email, hashedPassword, role, name],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    const userId = this.lastID;
                    
                    if (role === 'patient') {
                        // Insert patient with NIK
                        db.run(
                            `INSERT INTO patients (user_id, full_name, nik, date_of_birth, gender, phone, address, blood_type) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [userId, name, nik, date_of_birth, gender, phone, address, blood_type],
                            (err) => {
                                if (err) console.error('Error creating patient:', err);
                            }
                        );
                    }
                    
                    res.status(201).json({ message: 'Pendaftaran berhasil!' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Step 3: Update register-script.js
Pastikan NIK dikirim ke backend:

```javascript
async function registerAPI(data) {
    const payload = {
        email: data.email,
        password: data.password,
        role: 'patient',
        name: data.namaLengkap,
        nik: data.nik,  // ← TAMBAHKAN INI
        date_of_birth: data.tanggalLahir,
        gender: data.jenisKelamin,
        phone: data.nomorHP,
        address: data.alamat,
        blood_type: data.golonganDarah
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.error || 'Pendaftaran gagal');
    }
    
    return result;
}
```

---

## 📝 FILE YANG PERLU DIPERBAIKI

1. ✅ **register.html** - Tambah Step 2
2. ✅ **backend/routes/auth.js** - Tambah field NIK
3. ✅ **register-script.js** - Kirim NIK ke backend

---

## 🧪 TESTING

### 1. Test Frontend Form
- Buka: http://localhost:3000/register.html
- Cek ada 3 steps
- Isi semua field
- Klik "Daftar Sekarang"

### 2. Test Backend
- Monitor server log
- Cek query INSERT berhasil
- Verify data masuk database

### 3. Test Login
- Setelah berhasil register
- Login dengan email + password yang didaftarkan
- Harus berhasil masuk

---

## 🎯 HASIL YANG DIHARAPKAN

1. ✅ Form registrasi lengkap dengan 3 steps
2. ✅ Data tersimpan ke database (users + patients)
3. ✅ NIK ikut tersimpan
4. ✅ Bisa login dengan akun yang didaftarkan
5. ✅ Redirect ke login setelah sukses register

---

## ⚡ QUICK FIX

Saya akan buat file HTML Step 2 yang bisa di-copy paste langsung!
