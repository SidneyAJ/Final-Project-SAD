const mysql = require('mysql2/promise');

// Create connection pool with explicit settings to avoid timeout
const pool = mysql.createPool({
    host: '127.0.0.1', // Explicit IPv4 to avoid IPv6 issues
    user: 'root',
    password: '',
    database: 'klinik_sentosa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000, // 20 seconds timeout
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL database (klinik_sentosa)');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection error:', err.message);
    });

// Helper function for queries
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Export pool and query function
module.exports = {
    pool,
    query,
    // Compatibility methods for existing code
    run: async (sql, params) => {
        return await query(sql, params);
    },
    get: async (sql, params) => {
        const results = await query(sql, params);
        return results[0]; // Return first row
    },
    all: async (sql, params) => {
        return await query(sql, params);
    }
};
