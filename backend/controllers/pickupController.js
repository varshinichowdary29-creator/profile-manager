const { PickupAuthorization, Student, ActivityLog, Class } = require('../models');

// @desc    Get pickup authorization details
// @route   GET /api/pickup
// @access  Private
const getAuthorizations = async (req, res) => {
  try {
    const { studentId } = req.query;
    const whereClause = {};

    if (studentId) whereClause.studentId = studentId;

    const list = await PickupAuthorization.findAll({
      where: whereClause,
      include: [
        { 
          model: Student, 
          attributes: ['id', 'fullName', 'studentId'],
          include: [{ model: Class, attributes: ['name'] }]
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('[Pickup Controller] GetAuthorizations error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving authorization listings.' });
  }
};

// @desc    Authorize a pickup guardian
// @route   POST /api/pickup
// @access  Private (Admin / Parent / Staff)
const addAuthorization = async (req, res) => {
  try {
    const { studentId, name, relationship, contactNumber, pinCode } = req.body;

    if (!studentId || !name || !relationship || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Missing required details.' });
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Generates a 4-digit code if not supplied
    const finalPin = pinCode || String(Math.floor(1000 + Math.random() * 9000));

    const auth = await PickupAuthorization.create({
      studentId,
      name,
      relationship,
      contactNumber,
      pinCode: finalPin,
      status: 'Authorized',
      photoUrl: req.body.photoUrl || null
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'PICKUP_AUTHORIZE',
      details: `Authorized pickup guardian '${name}' (${relationship}) for student ${student.fullName}. Security PIN: ${finalPin}`
    });

    res.status(201).json({ success: true, message: 'Pickup guardian authorized.', data: auth });
  } catch (error) {
    console.error('[Pickup Controller] AddAuthorization error:', error);
    res.status(500).json({ success: false, message: 'Server error authorizing pickup.', error: error.message });
  }
};

// @desc    Verify security PIN for child checkout approval
// @route   POST /api/pickup/verify
// @access  Private (Admin / Front Desk Staff)
const verifyPickup = async (req, res) => {
  try {
    const { authorizationId, pinCode } = req.body;

    if (!authorizationId || !pinCode) {
      return res.status(400).json({ success: false, message: 'Authentication details missing.' });
    }

    const auth = await PickupAuthorization.findByPk(authorizationId, {
      include: [{ model: Student }]
    });

    if (!auth) {
      return res.status(404).json({ success: false, message: 'Guardian record not found.' });
    }

    if (auth.status === 'Revoked') {
      return res.status(403).json({ success: false, message: 'Access Denied: This guardian\'s authorization has been revoked.' });
    }

    if (auth.pinCode !== pinCode) {
      // Log failed attempt
      await ActivityLog.create({
        userId: req.user.id,
        action: 'PICKUP_VERIFY_FAIL',
        details: `Failed pickup PIN verification for student: ${auth.Student.fullName} using guardian: ${auth.name}`
      });
      return res.status(401).json({ success: false, message: 'Verification Failed: Invalid PIN code.' });
    }

    // Log success
    await ActivityLog.create({
      userId: req.user.id,
      action: 'PICKUP_VERIFY_SUCCESS',
      details: `Security Verified: Child '${auth.Student.fullName}' picked up by authorized guardian '${auth.name}' (${auth.relationship}).`
    });

    res.json({ 
      success: true, 
      message: `Verification Success! Checkout approved for ${auth.Student.fullName} with guardian ${auth.name}.`,
      data: {
        studentName: auth.Student.fullName,
        guardianName: auth.name,
        relationship: auth.relationship,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('[Pickup Controller] VerifyPickup error:', error);
    res.status(500).json({ success: false, message: 'Server error during security verification.', error: error.message });
  }
};

module.exports = { getAuthorizations, addAuthorization, verifyPickup };
