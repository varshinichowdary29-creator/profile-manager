const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance } = require('../controllers/attendanceController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(checkRole(['Super Admin', 'School Admin', 'Teacher', 'Front Desk Staff']), markAttendance);

module.exports = router;
