const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Parent = sequelize.define('Parent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  relationType: {
    type: DataTypes.ENUM('Father', 'Mother', 'Guardian'),
    allowNull: false,
    defaultValue: 'Guardian'
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alternativeContact: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Parent;
