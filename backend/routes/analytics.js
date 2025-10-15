const express = require('express');
const router = express.Router();
const { getDashboardStats, getUserActivity } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/activity', authenticateToken, getUserActivity);

module.exports = router;