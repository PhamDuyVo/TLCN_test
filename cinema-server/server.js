const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

// Nạp kết nối MySQL CSDL
const pool = require('./src/config/db');

// Nạp routes
const routes = require('./src/routes');

const app = express();
const server = http.createServer(app);

// Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình API Routes
app.use('/api', routes);

// Cấu hình Socket.IO Realtime Sơ đồ ghế
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.IO] Client kết nối thành công: ${socket.id}`);

  socket.on('join_showtime', (showtimeId) => {
    socket.join(`showtime_${showtimeId}`);
    console.log(`📌 Socket ${socket.id} đã tham gia phòng suất chiếu: showtime_${showtimeId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.IO] Client ngắt kết nối: ${socket.id}`);
  });
});

// Endpoint kiểm tra sức khỏe hệ thống API (Health check)
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS server_time');
    res.json({
      status: 'online',
      message: 'Hệ thống Backend Cinema Server & MySQL Database hoạt động bình thường',
      db_time: rows[0].server_time,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Port listener
const PORT = process.env.PORT || 5000;

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ [Port Conflict] Cổng ${PORT} hiện đang bị chiếm dụng bởi tiến trình khác.`);
  } else {
    console.error('❌ Server error:', e);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 [Cinema Server] Running on http://localhost:${PORT}`);
});
