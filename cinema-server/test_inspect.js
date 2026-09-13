const mysql = require('mysql2/promise');

async function inspectDb() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'movie_ticket_system_fixed1',
    });

    console.log('--- TABLES IN MOVIE_TICKET_SYSTEM_FIXED1 ---');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(tables);

    const [userRows] = await conn.query('SELECT id, full_name, email, role, cinema_id, status FROM users LIMIT 5');
    console.log('\n--- SAMPLE USERS ---');
    console.table(userRows);

    const [movieRows] = await conn.query('SELECT id, title, duration_minutes, age_rating, status FROM movies LIMIT 5');
    console.log('\n--- SAMPLE MOVIES ---');
    console.table(movieRows);

    const [cinemaRows] = await conn.query('SELECT id, name, city, status FROM cinemas LIMIT 5');
    console.log('\n--- SAMPLE CINEMAS ---');
    console.table(cinemaRows);

    const [showtimeRows] = await conn.query('SELECT id, movie_id, room_id, start_time, base_price, screen_format, status FROM showtimes LIMIT 5');
    console.log('\n--- SAMPLE SHOWTIMES ---');
    console.table(showtimeRows);

    await conn.end();
  } catch (err) {
    console.error('Loi:', err.message);
  }
}

inspectDb();
