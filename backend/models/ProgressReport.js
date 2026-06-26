const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProgressReport = sequelize.define('ProgressReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  skillName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ProgressReport;
