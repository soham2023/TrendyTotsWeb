const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectToDatabase = require('./config/dbconn');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve static files

// Connect to MongoDB
connectToDatabase();

// Import routes
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Not Found',
    });
});

module.exports = app;
