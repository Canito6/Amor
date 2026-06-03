const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const coupleRoutes = require('./couple');
const adminRoutes = require('./admin');
const messageRoutes = require('./messages');
const photoRoutes = require('./photos');
const memoryRoutes = require('./memories');
const albumRoutes = require('./albums');
const quizRoutes = require('./quizzes');
const eventRoutes = require('./events');
const tabRoutes = require('./tabs');
const funRoutes = require('./fun');
const dailyCheckInRoutes = require('./dailyCheckIn');

// Mapeamento idêntico ao server.js original para preservar endpoints da API
router.use('/auth', authRoutes);
router.use('/auth', coupleRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messageRoutes);
router.use('/photos', photoRoutes);
router.use('/memories', memoryRoutes);
router.use('/albums', albumRoutes);
router.use('/quizzes', quizRoutes);
router.use('/events', eventRoutes);
router.use('/tabs', tabRoutes);
router.use('/fun', funRoutes);
router.use('/daily-checkin', dailyCheckInRoutes);

module.exports = router;
