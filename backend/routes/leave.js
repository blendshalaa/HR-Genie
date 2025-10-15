const express = require('express');
const router = express.Router();
const {
  getMyLeaveRequests,
  getAllLeaveRequests,
  createLeaveRequest,
  updateLeaveRequestStatus,
  getLeaveBalance
} = require('../controllers/leaveController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/my-requests', authenticateToken, getMyLeaveRequests);
router.get('/all-requests', authenticateToken, authorizeRoles('hr', 'admin'), getAllLeaveRequests);
router.post('/request', authenticateToken, createLeaveRequest);
router.patch('/:id/status', authenticateToken, authorizeRoles('hr', 'admin'), updateLeaveRequestStatus);
router.get('/balance', authenticateToken, getLeaveBalance);

module.exports = router;