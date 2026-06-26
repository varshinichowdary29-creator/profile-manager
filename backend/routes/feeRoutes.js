const express = require('express');
const router = express.Router();
const { getFees, createFee, payFee } = require('../controllers/feeController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFees)
  .post(checkRole(['Super Admin', 'School Admin']), createFee);

router.post('/:id/pay', payFee);

module.exports = router;
