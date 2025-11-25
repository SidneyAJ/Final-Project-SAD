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

// Compatibility methods for callback-based code (used by auth and admin routes)
function run(sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    pool.execute(sql, params)
        .then(([results]) => {
            // Simulate SQLite's this.lastID and this.changes
            const context = {
                lastID: results.insertId || 0,
                changes: results.affectedRows || 0
            };
            if (callback) callback.call(context, null);
        })
        .catch(err => {
            if (callback) callback(err);
        });
}

function get(sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    pool.execute(sql, params)
        .then(([results]) => {
            if (callback) callback(null, results[0] || null);
        })
        .catch(err => {
            if (callback) callback(err);
        });
}

function all(sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    pool.execute(sql, params)
        .then(([results]) => {
            if (callback) callback(null, results);
        })
        .catch(err => {
            if (callback) callback(err);
        });
}

function serialize(callback) {
    // MySQL doesn't need serialization, but we provide this for compatibility
    if (callback) callback();
}

// Export pool and query function
module.exports = {
    pool,
    query,
    run,
    get,
    all,
    serialize
};
