const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'klinik_sentosa'
};

async function getUsers() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [users] = await connection.execute(`
            SELECT u.username, u.role, u.email, 'password123' as password_hint 
            FROM users u 
            ORDER BY u.role
        `);
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

getUsers();
