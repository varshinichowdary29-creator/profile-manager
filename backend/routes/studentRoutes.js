const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(checkRole(['Super Admin', 'School Admin', 'Teacher', 'Front Desk Staff']), createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(checkRole(['Super Admin', 'School Admin', 'Teacher', 'Front Desk Staff']), updateStudent)
  .delete(checkRole(['Super Admin']), deleteStudent);

module.exports = router;
