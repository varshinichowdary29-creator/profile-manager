const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Allergy = sequelize.define('Allergy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  allergen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Low'
  },
  reaction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  treatment: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Allergy;
