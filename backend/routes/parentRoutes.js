const express = require('express');
const router = express.Router();
const { getParents, createParent } = require('../controllers/parentController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getParents)
  .post(checkRole(['Super Admin', 'School Admin', 'Front Desk Staff']), createParent);

module.exports = router;
