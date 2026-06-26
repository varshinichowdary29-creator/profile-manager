const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  medicalConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyProcedures: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  healthNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = MedicalRecord;
