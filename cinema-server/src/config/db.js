const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo connection pool tới MySQL CSDL movie_ticket_system_fixed1
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'movie_ticket_system_fixed1',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
  queueLimit: 0,
  timezone: '+07:00', // Giờ Việt Nam
  charset: 'utf8mb4',
});

// Hàm test kết nối khi khởi động server
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(` [MySQL Database] Kết nối thành công tới CSDL: "${process.env.DB_NAME || 'movie_ticket_system_fixed1'}"`);
    connection.release();
  } catch (error) {
    console.error(' [MySQL Database Error] Lỗi kết nối CSDL:', error.message);
  }
};

testDbConnection();

module.exports = pool;
