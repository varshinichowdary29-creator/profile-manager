const { Parent, Student, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private
const getParents = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const parents = await Parent.findAll({
      where: whereClause,
      include: [{ model: Student, as: 'students', through: { attributes: [] } }],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, count: parents.length, data: parents });
  } catch (error) {
    console.error('[Parent Controller] GetParents error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving parents.' });
  }
};

// @desc    Create a parent profile
// @route   POST /api/parents
// @access  Private (Admin / Staff)
const createParent = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      email,
      occupation,
      address,
      relationType,
      emergencyContact,
      alternativeContact,
      studentIds
    } = req.body;

    const parent = await Parent.create({
      name,
      mobileNumber,
      email,
      occupation,
      address,
      relationType,
      emergencyContact,
      alternativeContact
    });

    if (studentIds && studentIds.length > 0) {
      const students = await Student.findAll({ where: { id: studentIds } });
      await parent.addStudents(students);
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'PARENT_CREATE',
      details: `Created Parent Profile: ${name}`
    });

    res.status(201).json({ success: true, message: 'Parent profile created successfully.', data: parent });
  } catch (error) {
    console.error('[Parent Controller] CreateParent error:', error);
    res.status(500).json({ success: false, message: 'Server error creating parent profile.', error: error.message });
  }
};

module.exports = { getParents, createParent };
