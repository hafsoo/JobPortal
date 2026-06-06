const router = require('express').Router();
const {
  applyToJob, getMyApplications, getJobApplicants, updateStatus
} = require('../controllers/applicationController');
const { protect, recruiterOnly, seekerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/:jobId',           protect, seekerOnly, upload.single('resume'), applyToJob);
router.get('/mine',              protect, seekerOnly, getMyApplications);
router.get('/job/:jobId',        protect, recruiterOnly, getJobApplicants);
router.patch('/:id/status',      protect, recruiterOnly, updateStatus);
router.get('/job/:jobId',    protect, recruiterOnly, getJobApplicants);
router.patch('/:id/status',  protect, recruiterOnly, updateStatus);
module.exports = router;