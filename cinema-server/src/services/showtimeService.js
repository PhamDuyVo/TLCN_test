const db = require('../config/db');

class ShowtimeService {
  // Lấy danh sách suất chiếu của 1 phim theo ngày (gom nhóm theo rạp)
  async getShowtimesByMovie(movieId, date) {
    let query = `
      SELECT 
        st.id AS showtime_id,
        st.start_time,
        st.end_time,
        st.base_price,
        st.screen_format,
        st.status AS showtime_status,
        r.id AS room_id,
        r.name AS room_name,
        r.room_type,
        c.id AS cinema_id,
        c.name AS cinema_name,
        c.address AS cinema_address,
        c.city AS cinema_city
      FROM showtimes st
      JOIN rooms r ON st.room_id = r.id
      JOIN cinemas c ON r.cinema_id = c.id
      WHERE st.movie_id = ?
    `;

    const queryParams = [movieId];

    if (date) {
      query += ' AND DATE(st.start_time) = ?';
      queryParams.push(date);
    }

    query += ' ORDER BY c.id, st.start_time ASC';

    const [rows] = await db.query(query, queryParams);

    // Grouping kết quả theo Cụm Rạp
    const cinemaMap = {};
    for (const row of rows) {
      const cinemaId = row.cinema_id;
      if (!cinemaMap[cinemaId]) {
        cinemaMap[cinemaId] = {
          cinema_id: row.cinema_id,
          cinema_name: row.cinema_name,
          cinema_address: row.cinema_address,
          cinema_city: row.cinema_city,
          showtimes: [],
        };
      }
      cinemaMap[cinemaId].showtimes.push({
        showtime_id: row.showtime_id,
        start_time: row.start_time,
        end_time: row.end_time,
        base_price: row.base_price,
        screen_format: row.screen_format,
        room_id: row.room_id,
        room_name: row.room_name,
        room_type: row.room_type,
      });
    }

    return Object.values(cinemaMap);
  }

  // Lấy chi tiết suất chiếu kèm ma trận ghế
  async getShowtimeSeats(showtimeId) {
    // 1. Lấy thông tin suất chiếu & phim
    const [stRows] = await db.query(
      `
      SELECT st.*, m.title AS movie_title, m.duration_minutes, m.age_rating, r.name AS room_name, c.name AS cinema_name
      FROM showtimes st
      JOIN movies m ON st.movie_id = m.id
      JOIN rooms r ON st.room_id = r.id
      JOIN cinemas c ON r.cinema_id = c.id
      WHERE st.id = ?
    `,
      [showtimeId]
    );

    if (!stRows.length) return null;
    const showtimeInfo = stRows[0];

    // 2. Lấy tất cả ghế trong phòng chiếu + trạng thái trong showtime_seats
    const [seats] = await db.query(
      `
      SELECT 
        s.id AS seat_id,
        s.row_label,
        s.seat_number,
        stype.name AS seat_type_name,
        stype.price_extra,
        COALESCE(ss.status, 'available') AS status,
        ss.held_by_user_id,
        ss.hold_expires_at
      FROM seats s
      JOIN seat_types stype ON s.seat_type_id = stype.id
      LEFT JOIN showtime_seats ss ON s.id = ss.seat_id AND ss.showtime_id = ?
      WHERE s.room_id = ? AND s.status = 'active'
      ORDER BY s.row_label ASC, s.seat_number ASC
    `,
      [showtimeId, showtimeInfo.room_id]
    );

    return {
      showtime: showtimeInfo,
      seats,
    };
  }
}

module.exports = new ShowtimeService();
