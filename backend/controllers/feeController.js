const { Fee, Payment, Student, Class, ActivityLog } = require('../models');

// @desc    Get fees list
// @route   GET /api/fees
// @access  Private
const getFees = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const whereClause = {};

    if (studentId) whereClause.studentId = studentId;
    if (status) whereClause.status = status;

    const fees = await Fee.findAll({
      where: whereClause,
      include: [
        { 
          model: Student, 
          attributes: ['id', 'fullName', 'studentId'],
          include: [{ model: Class, attributes: ['name'] }]
        },
        { model: Payment }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    console.error('[Fee Controller] GetFees error:', error);
    res.status(500).json({ success: false, message: 'Server error loading fees records.' });
  }
};

// @desc    Create/assign fee to a student or class
// @route   POST /api/fees
// @access  Private (Admin / Staff)
const createFee = async (req, res) => {
  try {
    const { title, amount, dueDate, studentId, classId } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    let students = [];

    if (studentId) {
      students = await Student.findAll({ where: { id: studentId } });
    } else if (classId) {
      students = await Student.findAll({ where: { classId } });
    } else {
      // Assign to all active students if neither studentId nor classId is specified
      students = await Student.findAll({ where: { status: 'Active' } });
    }

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found to assign this fee.' });
    }

    const feePromises = students.map(student => 
      Fee.create({
        studentId: student.id,
        title,
        amount,
        dueDate,
        status: 'Unpaid',
        paidAmount: 0.00
      })
    );

    const createdFees = await Promise.all(feePromises);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'FEE_CREATE',
      details: `Assigned fee '${title}' of ₹${amount} to ${students.length} students.`
    });

    res.status(201).json({ success: true, message: 'Fees assigned successfully.', count: createdFees.length });
  } catch (error) {
    console.error('[Fee Controller] CreateFee error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning fees.', error: error.message });
  }
};

// @desc    Record a payment transaction
// @route   POST /api/fees/:id/pay
// @access  Private
const payFee = async (req, res) => {
  try {
    const { amountPaid, paymentMethod, transactionId } = req.body;
    const fee = await Fee.findByPk(req.params.id, {
      include: [{ model: Student }]
    });

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found.' });
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This fee is already fully paid.' });
    }

    const outstanding = parseFloat(fee.amount) - parseFloat(fee.paidAmount);
    const paying = parseFloat(amountPaid);

    if (paying <= 0 || paying > outstanding) {
      return res.status(400).json({ success: false, message: `Invalid payment amount. Remaining outstanding is ₹${outstanding.toFixed(2)}` });
    }

    const totalPaid = parseFloat(fee.paidAmount) + paying;
    let newStatus = 'Partially Paid';
    if (totalPaid >= parseFloat(fee.amount)) {
      newStatus = 'Paid';
    }

    const receiptCount = await Payment.count();
    const receiptNumber = `RCPT-${String(receiptCount + 1).padStart(6, '0')}`;

    const payment = await Payment.create({
      feeId: fee.id,
      amountPaid: paying,
      paymentMethod: paymentMethod || 'Online',
      transactionId: transactionId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      receiptNumber
    });

    await fee.update({
      paidAmount: totalPaid,
      status: newStatus
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'FEE_PAYMENT',
      details: `Recorded payment of ₹${paying} for fee '${fee.title}' of student ${fee.Student.fullName}. Receipt: ${receiptNumber}`
    });

    res.json({ 
      success: true, 
      message: 'Payment recorded successfully.', 
      data: {
        payment,
        feeStatus: newStatus,
        outstanding: (parseFloat(fee.amount) - totalPaid)
      } 
    });
  } catch (error) {
    console.error('[Fee Controller] PayFee error:', error);
    res.status(500).json({ success: false, message: 'Server error processing payment.', error: error.message });
  }
};

module.exports = { getFees, createFee, payFee };
