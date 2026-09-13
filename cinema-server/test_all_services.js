const movieService = require('./src/services/movieService');
const showtimeService = require('./src/services/showtimeService');
const pool = require('./src/config/db');

async function testAll() {
  console.log('=== TEST 1: getAllMovies("now_showing") ===');
  try {
    const movies1 = await movieService.getAllMovies('now_showing');
    console.log('OK. Result count:', movies1.length);
    console.log(movies1);
  } catch (err) {
    console.error('FAIL getAllMovies("now_showing"):', err.message);
  }

  console.log('\n=== TEST 2: getAllMovies("coming_soon") ===');
  try {
    const movies2 = await movieService.getAllMovies('coming_soon');
    console.log('OK. Result count:', movies2.length);
    console.log(movies2);
  } catch (err) {
    console.error('FAIL getAllMovies("coming_soon"):', err.message);
  }

  console.log('\n=== TEST 3: getMovieById(6) ===');
  try {
    const movie = await movieService.getMovieById(6);
    console.log('OK. Movie title:', movie ? movie.title : 'Not found');
  } catch (err) {
    console.error('FAIL getMovieById(6):', err.message);
  }

  console.log('\n=== TEST 4: getShowtimesByMovie(6) ===');
  try {
    const showtimes = await showtimeService.getShowtimesByMovie(6);
    console.log('OK. Showtimes result:', showtimes);
  } catch (err) {
    console.error('FAIL getShowtimesByMovie(6):', err.message);
  }

  console.log('\n=== TEST 5: getShowtimeSeats(1) ===');
  try {
    const seats = await showtimeService.getShowtimeSeats(1);
    console.log('OK. Seats result:', seats ? `Found ${seats.seats.length} seats` : 'Null');
  } catch (err) {
    console.error('FAIL getShowtimeSeats(1):', err.message);
  }

  process.exit(0);
}

testAll();
