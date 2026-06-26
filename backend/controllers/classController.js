const { Class } = require('../models');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    console.error('[Class Controller] GetClasses error:', error);
    res.status(500).json({ success: false, message: 'Server error loading classes.', error: error.message });
  }
};

module.exports = {
  getClasses
};
