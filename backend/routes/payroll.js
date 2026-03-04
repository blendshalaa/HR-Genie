const express = require('express');
const router = express.Router();
const {
    getAllPayrolls,
    getPayrollById,
    getPayrollByUser,
    createPayroll,
    updatePayrollStatus
} = require('../controllers/payrollController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), getAllPayrolls);
router.get('/user/:userId', authenticateToken, getPayrollByUser);
router.get('/:id', authenticateToken, getPayrollById);
router.post('/calculate', authenticateToken, authorizeRoles('admin', 'hr'), createPayroll);
router.put('/:id/pay', authenticateToken, authorizeRoles('admin', 'hr'), updatePayrollStatus);

module.exports = router;
