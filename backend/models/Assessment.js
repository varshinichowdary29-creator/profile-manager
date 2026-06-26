const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Assessment = sequelize.define('Assessment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Cognitive', 'Physical/Motor', 'Language', 'Social/Emotional'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Assessment;
