const express = require('express');
const router = express.Router();
const { getAuthorizations, addAuthorization, verifyPickup } = require('../controllers/pickupController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAuthorizations)
  .post(checkRole(['Super Admin', 'School Admin', 'Parent', 'Front Desk Staff']), addAuthorization);

router.post('/verify', checkRole(['Super Admin', 'School Admin', 'Front Desk Staff']), verifyPickup);

module.exports = router;
