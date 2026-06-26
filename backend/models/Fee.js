const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid', 'Partially Paid'),
    allowNull: false,
    defaultValue: 'Unpaid'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
});

module.exports = Fee;
