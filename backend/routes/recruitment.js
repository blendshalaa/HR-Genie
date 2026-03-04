const express = require('express');
const router = express.Router();
const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    getAllApplications,
    getApplicationsForJob,
    submitApplication,
    updateApplicationStatus
} = require('../controllers/recruitmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Job Routes
router.get('/jobs', authenticateToken, getAllJobs);
router.get('/jobs/:id', authenticateToken, getJobById);
router.post('/jobs', authenticateToken, authorizeRoles('admin', 'hr'), createJob);
router.put('/jobs/:id', authenticateToken, authorizeRoles('admin', 'hr'), updateJob);

// Application Routes
router.get('/applications', authenticateToken, authorizeRoles('admin', 'hr'), getAllApplications);
router.get('/jobs/:jobId/applications', authenticateToken, authorizeRoles('admin', 'hr'), getApplicationsForJob);
router.post('/jobs/:jobId/applications', authenticateToken, submitApplication);
router.put('/applications/:id/status', authenticateToken, authorizeRoles('admin', 'hr'), updateApplicationStatus);

module.exports = router;
