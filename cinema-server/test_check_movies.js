const db = require('./src/config/db');

async function testMovies() {
  try {
    const [allMovies] = await db.query('SELECT id, title, status FROM movies');
    console.log('--- TOÀN BỘ PHIM TRONG DB ---');
    console.log(allMovies);

    const [nowShowing] = await db.query("SELECT id, title, status FROM movies WHERE status = 'now_showing'");
    console.log('\n--- PHIM STATUS = now_showing ---');
    console.log(nowShowing);

    const [comingSoon] = await db.query("SELECT id, title, status FROM movies WHERE status = 'coming_soon'");
    console.log('\n--- PHIM STATUS = coming_soon ---');
    console.log(comingSoon);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testMovies();
