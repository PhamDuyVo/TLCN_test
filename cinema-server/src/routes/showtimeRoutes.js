const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');

router.get('/movie/:movieId', showtimeController.getShowtimesByMovie);
router.get('/:showtimeId/seats', showtimeController.getShowtimeSeats);

module.exports = router;
