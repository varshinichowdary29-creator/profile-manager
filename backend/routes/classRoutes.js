const express = require('express');
const router = express.Router();
const { getClasses } = require('../controllers/classController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getClasses);

module.exports = router;
