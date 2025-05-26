import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'goworship_database'
});

export async function verifyAdmin(email: string, password: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tb_admin WHERE email = ? AND password = ?',
      [email, password]
    );
    return (rows as any[]).length > 0;
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
}