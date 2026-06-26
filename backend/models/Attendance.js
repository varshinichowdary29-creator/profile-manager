const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Excused'),
    allowNull: false,
    defaultValue: 'Present'
  },
  checkInTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  checkOutTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Attendance;
