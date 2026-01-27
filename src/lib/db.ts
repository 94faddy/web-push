import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'web_push_db',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5, // Max idle connections (ลด idle connections ที่อาจ stale)
  idleTimeout: 60000, // 60 seconds - ปิด idle connection หลัง 60 วินาที
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 10000, // 10 seconds timeout สำหรับสร้าง connection
  enableKeepAlive: true, // เปิด TCP keep-alive
  keepAliveInitialDelay: 10000, // ส่ง keep-alive ทุก 10 วินาที
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release(); // สำคัญมาก! ต้อง release connection กลับ pool
    }
  }
}

export async function getConnection() {
  return await pool.getConnection();
}

export default pool;