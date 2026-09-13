const mysql = require('mysql2/promise');

const passwords = ['', 'root', '123456', '12345678', 'admin', 'mysql', '1234'];

async function testConnection() {
  for (const pass of passwords) {
    try {
      console.log(`Thu ket noi MySQL com root & pass="${pass}"...`);
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pass,
      });
      console.log(`SUCCESS! Ket noi thanh cong voi pass="${pass}"`);
      const [dbs] = await conn.query('SHOW DATABASES');
      console.log('Danh sach CSDL:', dbs.map(d => d.Database));
      await conn.end();
      return { success: true, password: pass };
    } catch (err) {
      console.log(`Loi pass="${pass}": ${err.message}`);
    }
  }
  return { success: false };
}

testConnection();
