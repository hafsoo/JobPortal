const router = require('express').Router();
const { createJob, getAllJobs, getMyJobs, deleteJob } = require('../controllers/jobController');
const { protect, recruiterOnly } = require('../middleware/authMiddleware');

router.get('/',        getAllJobs);
router.post('/',       protect, recruiterOnly, createJob);
router.get('/mine',    protect, recruiterOnly, getMyJobs);
router.delete('/:id',  protect, recruiterOnly, deleteJob);

module.exports = router;