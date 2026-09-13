const db = require('./src/config/db');

async function dumpMovies() {
  try {
    const [rows] = await db.query('SELECT * FROM movies');
    console.log('--- CHI TIẾT TẤT CẢ PHIM IN MYSQL DB ---');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpMovies();
