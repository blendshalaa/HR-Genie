const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);

module.exports = router;