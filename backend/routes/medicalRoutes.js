const express = require('express');
const router = express.Router();
const { getMedicalRecords, updateMedicalRecord } = require('../controllers/medicalController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMedicalRecords);

router.route('/:id')
  .put(checkRole(['Super Admin', 'School Admin', 'Teacher', 'Front Desk Staff']), updateMedicalRecord);

module.exports = router;
