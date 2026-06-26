const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.ENUM('Cash', 'Card', 'Bank Transfer', 'Online'),
    allowNull: false,
    defaultValue: 'Online'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Payment;
