const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

router.route('/').get(getJobs).post(createJob);
router.route('/:id').get(validateObjectId, getJob).put(validateObjectId, updateJob).delete(validateObjectId, deleteJob);

module.exports = router;
