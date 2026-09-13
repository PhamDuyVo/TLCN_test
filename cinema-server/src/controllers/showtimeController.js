const showtimeService = require('../services/showtimeService');

class ShowtimeController {
  async getShowtimesByMovie(req, res) {
    try {
      const { movieId } = req.params;
      const { date } = req.query;
      const data = await showtimeService.getShowtimesByMovie(movieId, date);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Lỗi getShowtimesByMovie:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch chiếu' });
    }
  }

  async getShowtimeSeats(req, res) {
    try {
      const { showtimeId } = req.params;
      const data = await showtimeService.getShowtimeSeats(showtimeId);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy suất chiếu' });
      }
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Lỗi getShowtimeSeats:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy sơ đồ ghế' });
    }
  }
}

module.exports = new ShowtimeController();
