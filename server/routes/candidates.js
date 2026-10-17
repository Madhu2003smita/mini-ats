const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  updateCandidateStage,
  deleteCandidate,
} = require('../controllers/candidateController');

router.route('/').get(getCandidates).post(createCandidate);
router
  .route('/:id')
  .get(validateObjectId, getCandidate)
  .put(validateObjectId, updateCandidate)
  .delete(validateObjectId, deleteCandidate);
router.patch('/:id/stage', validateObjectId, updateCandidateStage);

module.exports = router;
