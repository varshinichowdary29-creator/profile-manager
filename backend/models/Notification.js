const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Alert', 'Announcement', 'Message'),
    allowNull: false,
    defaultValue: 'Announcement'
  },
  recipientRole: {
    type: DataTypes.ENUM('All', 'Super Admin', 'School Admin', 'Teacher', 'Parent', 'Front Desk Staff'),
    allowNull: false,
    defaultValue: 'All'
  }
});

module.exports = Notification;
