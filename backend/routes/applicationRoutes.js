import express from 'express';
import { 
  applyForJob, 
  getMyApplications, 
  getApplicationsForJob, 
  updateApplicationStatus, 
  getAdminAnalytics 
} from '../controllers/applicationController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/apply/:jobId', protect, applyForJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/job/:jobId', protect, admin, getApplicationsForJob);
router.put('/:id/status', protect, admin, updateApplicationStatus);
router.get('/analytics', protect, admin, getAdminAnalytics);

export default router;
