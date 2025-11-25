const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'klinik_sentosa'
};

async function setupPharmacySystem() {
    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log('🔧 Starting pharmacy system database setup...\n');

        // 1. Create medicines table
        console.log('1️⃣ Creating medicines table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS medicines (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                stock INT NOT NULL DEFAULT 0,
                unit ENUM('tablet', 'kaplet', 'kapsul', 'sachet', 'botol', 'ampul', 'tube', 'pcs', 'ml', 'mg') DEFAULT 'tablet',
                price DECIMAL(10,2) DEFAULT 0,
                minimum_stock INT DEFAULT 10,
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Medicines table created\n');

        // 2. Update prescriptions table
        console.log('2️⃣ Updating prescriptions table...');

        // Check if columns exist first
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'klinik_sentosa' 
            AND TABLE_NAME = 'prescriptions'
        `);

        const columnNames = columns.map(col => col.COLUMN_NAME);

        if (!columnNames.includes('verification_status')) {
            await connection.execute(`
                ALTER TABLE prescriptions 
                ADD COLUMN verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending'
            `);
            console.log('   ✅ Added verification_status column');
        }

        if (!columnNames.includes('verified_by')) {
            await connection.execute(`
                ALTER TABLE prescriptions 
                ADD COLUMN verified_by INT NULL,
                ADD CONSTRAINT fk_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
            `);
            console.log('   ✅ Added verified_by column with foreign key');
        }

        if (!columnNames.includes('verified_at')) {
            await connection.execute(`
                ALTER TABLE prescriptions 
                ADD COLUMN verified_at TIMESTAMP NULL
            `);
            console.log('   ✅ Added verified_at column');
        }

        if (!columnNames.includes('rejection_reason')) {
            await connection.execute(`
                ALTER TABLE prescriptions 
                ADD COLUMN rejection_reason TEXT NULL
            `);
            console.log('   ✅ Added rejection_reason column');
        }

        if (!columnNames.includes('dispensed')) {
            await connection.execute(`
                ALTER TABLE prescriptions 
                ADD COLUMN dispensed BOOLEAN DEFAULT FALSE
            `);
            console.log('   ✅ Added dispensed column');
        }

        if (!columnNames.includes('dispensed_at')) {
            await connection.execute(`
                ALTER TABLE prescriptions 
                ADD COLUMN dispensed_at TIMESTAMP NULL
            `);
            console.log('   ✅ Added dispensed_at column');
        }

        console.log('✅ Prescriptions table updated\n');

        // 3. Check if prescription_items table exists, if not create it
        console.log('3️⃣ Setting up prescription_items table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS prescription_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                prescription_id INT NOT NULL,
                medicine_id INT NULL,
                medicine_name VARCHAR(255) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                dosage VARCHAR(100),
                frequency VARCHAR(100),
                duration VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
                FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Prescription_items table created\n');

        // 4. Create stock_history table for audit
        console.log('4️⃣ Creating stock_history table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS stock_history (
                id INT PRIMARY KEY AUTO_INCREMENT,
                medicine_id INT NOT NULL,
                change_amount INT NOT NULL,
                reason VARCHAR(255),
                user_id INT,
                prescription_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Stock_history table created\n');

        // 5. Seed sample medicines
        console.log('5️⃣ Seeding sample medicines...');
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM medicines');

        if (existing[0].count === 0) {
            const sampleMedicines = [
                ['Paracetamol 500mg', 'Obat pereda nyeri dan penurun demam', 500, 'tablet', 500, 50, 'Analgesik'],
                ['Amoxicillin 500mg', 'Antibiotik untuk infeksi bakteri', 300, 'kaplet', 2000, 30, 'Antibiotik'],
                ['OBH Batuk', 'Sirup obat batuk', 100, 'botol', 15000, 20, 'Batuk & Flu'],
                ['Antasida', 'Obat maag', 200, 'sachet', 1500, 50, 'Pencernaan'],
                ['Vitamin C 1000mg', 'Suplemen vitamin C', 400, 'tablet', 800, 100, 'Vitamin'],
                ['Betadine Solution', 'Antiseptik luka', 50, 'botol', 25000, 10, 'Antiseptik'],
                ['Salbutamol Inhaler', 'Obat asma', 30, 'pcs', 45000, 5, 'Pernapasan'],
                ['Omeprazole 20mg', 'Obat lambung', 250, 'kapsul', 3000, 30, 'Pencernaan'],
                ['CTM 4mg', 'Antihistamin untuk alergi', 350, 'tablet', 300, 50, 'Alergi'],
                ['Diapet', 'Obat diare', 180, 'tablet', 1200, 50, 'Pencernaan']
            ];

            for (const med of sampleMedicines) {
                await connection.execute(`
                    INSERT INTO medicines (name, description, stock, unit, price, minimum_stock, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, med);
            }
            console.log('✅ Seeded 10 sample medicines\n');
        } else {
            console.log('⏭️  Medicines already exist, skipping seed\n');
        }

        console.log('✨ Database setup complete!\n');
        console.log('📊 Summary:');
        console.log('   - Medicines table: Ready');
        console.log('   - Prescriptions table: Updated with verification fields');
        console.log('   - Prescription_items table: Ready');
        console.log('   - Stock_history table: Ready for audit trail');
        console.log('   - Sample data: Loaded\n');

    } catch (error) {
        console.error('❌ Error during setup:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run the setup
setupPharmacySystem()
    .then(() => {
        console.log('🎉 Setup successful!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    });
