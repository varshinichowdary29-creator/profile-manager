const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const progressRoutes = require('./routes/progressRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const classRoutes = require('./routes/classRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets or uploaded photos if needed
app.use('/uploads', express.static('uploads'));

// Sync Database & Setup Models
const initializeDatabase = async () => {
  await connectDB();
  try {
    // Sync models
    await sequelize.sync({ force: false });
    console.log('[Database] Database tables synced successfully.');
  } catch (error) {
    console.error('[Database] Sync error:', error.message);
  }
};

initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'FirstCry Intellitots API is online and fully functional.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('[App Error Handler]', err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
