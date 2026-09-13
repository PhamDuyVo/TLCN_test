const express = require('express');
const router = express.Router();

const movieRoutes = require('./movieRoutes');
const showtimeRoutes = require('./showtimeRoutes');
const authRoutes = require('./authRoutes');

router.use('/movies', movieRoutes);
router.use('/showtimes', showtimeRoutes);
router.use('/auth', authRoutes);

module.exports = router;
