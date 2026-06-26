const { Notification, User, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// @desc    Get system notifications & announcements
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    
    // Parents/Teachers/etc see announcements matching 'All' or their specific role.
    // Admins see all logs.
    const whereClause = {
      [Op.or]: [
        { recipientRole: 'All' },
        { recipientRole: role }
      ]
    };

    if (role === 'Super Admin' || role === 'School Admin') {
      delete whereClause[Op.or]; // Admins retrieve everything
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error('[Communication Controller] GetNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error loading messages.' });
  }
};

// @desc    Publish a message/alert
// @route   POST /api/notifications
// @access  Private (Admin / Teacher / Staff)
const createNotification = async (req, res) => {
  try {
    const { title, content, type, recipientRole } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and Content are required.' });
    }

    const notice = await Notification.create({
      title,
      content,
      type: type || 'Announcement',
      recipientRole: recipientRole || 'All',
      userId: req.user.id
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'NOTIFICATION_PUBLISH',
      details: `Published alert: ${title} (${type}) for role: ${recipientRole}`
    });

    res.status(201).json({ success: true, message: 'Announcement published successfully.', data: notice });
  } catch (error) {
    console.error('[Communication Controller] CreateNotification error:', error);
    res.status(500).json({ success: false, message: 'Server error sending notice.', error: error.message });
  }
};

module.exports = { getNotifications, createNotification };
