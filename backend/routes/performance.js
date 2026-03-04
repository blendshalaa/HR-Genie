const express = require('express');
const router = express.Router();
const {
    getReviewsForUser,
    getReviewById,
    createReview,
    updateReview
} = require('../controllers/performanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/user/:userId', authenticateToken, getReviewsForUser);
router.get('/:id', authenticateToken, getReviewById);
router.post('/', authenticateToken, authorizeRoles('admin', 'hr', 'manager'), createReview);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr', 'manager'), updateReview);

module.exports = router;
