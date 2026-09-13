const db = require('../config/db');

class MovieService {
  // Lấy tất cả phim (có lọc theo status: now_showing / coming_soon / ended)
  async getAllMovies(status) {
    let query = `
      SELECT m.*, GROUP_CONCAT(g.name SEPARATOR ', ') AS genre_names
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
    `;
    const queryParams = [];

    if (status) {
      query += ' WHERE m.status = ?';
      queryParams.push(status);
    }

    query += ' GROUP BY m.id ORDER BY m.created_at DESC';

    const [rows] = await db.query(query, queryParams);
    return rows;
  }

  // Lấy chi tiết 1 phim theo ID
  async getMovieById(id) {
    const query = `
      SELECT m.*, GROUP_CONCAT(g.name SEPARATOR ', ') AS genre_names
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.id = ?
      GROUP BY m.id
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new MovieService();
