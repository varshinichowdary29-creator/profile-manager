const express = require('express');
const router = express.Router();
const { getNotifications, createNotification } = require('../controllers/communicationController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(checkRole(['Super Admin', 'School Admin', 'Teacher']), createNotification);

module.exports = router;
