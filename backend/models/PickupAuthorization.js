const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PickupAuthorization = sequelize.define('PickupAuthorization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Authorized', 'Revoked'),
    allowNull: false,
    defaultValue: 'Authorized'
  },
  pinCode: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = PickupAuthorization;
