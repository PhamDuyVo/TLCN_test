const movieService = require('../services/movieService');

class MovieController {
  async getAllMovies(req, res) {
    try {
      const { status } = req.query;
      const movies = await movieService.getAllMovies(status);
      res.json({
        success: true,
        data: movies,
      });
    } catch (error) {
      console.error('Lỗi getAllMovies:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách phim' });
    }
  }

  async getMovieById(req, res) {
    try {
      const { id } = req.params;
      const movie = await movieService.getMovieById(id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
      }
      res.json({
        success: true,
        data: movie,
      });
    } catch (error) {
      console.error('Lỗi getMovieById:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết phim' });
    }
  }
}

module.exports = new MovieController();
