const { Attendance, Student, Class, ActivityLog } = require('../models');

// @desc    Get attendance sheet for class and date
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please specify a date.' });
    }

    const whereStudent = {};
    if (classId) {
      whereStudent.classId = classId;
    }

    // Fetch all students in the class
    const students = await Student.findAll({
      where: whereStudent,
      include: [
        { model: Class, attributes: ['name'] }
      ],
      order: [['fullName', 'ASC']]
    });

    // Fetch attendance for this date
    const attendanceRecords = await Attendance.findAll({
      where: { date }
    });

    // Merge attendance records with the student list
    const sheet = students.map(student => {
      const record = attendanceRecords.find(r => r.studentId === student.id);
      return {
        id: record ? record.id : null,
        studentId: student.id,
        fullName: student.fullName,
        studentIdCode: student.studentId,
        className: student.Class ? student.Class.name : 'Unassigned',
        status: record ? record.status : 'Present', // Default is Present
        checkInTime: record ? record.checkInTime : '',
        checkOutTime: record ? record.checkOutTime : '',
        remarks: record ? record.remarks : ''
      };
    });

    res.json({ success: true, date, data: sheet });
  } catch (error) {
    console.error('[Attendance Controller] GetAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving attendance sheet.', error: error.message });
  }
};

// @desc    Mark attendance in bulk
// @route   POST /api/attendance
// @access  Private (Admin / Teacher / Staff)
const markAttendance = async (req, res) => {
  try {
    const { date, attendanceList } = req.body; // array of { studentId, status, checkInTime, checkOutTime, remarks }

    if (!date || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ success: false, message: 'Invalid payload.' });
    }

    const promises = attendanceList.map(async (record) => {
      const [attendance, created] = await Attendance.findOrCreate({
        where: { studentId: record.studentId, date },
        defaults: {
          status: record.status || 'Present',
          checkInTime: record.checkInTime || '09:00 AM',
          checkOutTime: record.checkOutTime || '03:30 PM',
          remarks: record.remarks || ''
        }
      });

      if (!created) {
        await attendance.update({
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          remarks: record.remarks
        });
      }
    });

    await Promise.all(promises);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'ATTENDANCE_MARK',
      details: `Marked attendance for ${attendanceList.length} students on ${date}`
    });

    res.json({ success: true, message: 'Attendance updated successfully.' });
  } catch (error) {
    console.error('[Attendance Controller] MarkAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error updating attendance.', error: error.message });
  }
};

module.exports = { getAttendance, markAttendance };
