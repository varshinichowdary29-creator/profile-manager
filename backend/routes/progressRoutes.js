const express = require('express');
const router = express.Router();
const { getStudentAssessments, createAssessment } = require('../controllers/progressController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.post('/', checkRole(['Super Admin', 'School Admin', 'Teacher']), createAssessment);
router.get('/:studentId', getStudentAssessments);

module.exports = router;
