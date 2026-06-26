const { Op } = require('sequelize');
const { Student, Class, Parent, MedicalRecord, Allergy, PickupAuthorization, ActivityLog } = require('../models');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { classId, status, search, gender } = req.query;
    const whereClause = {};

    if (classId) whereClause.classId = classId;
    if (status) whereClause.status = status;
    if (gender) whereClause.gender = gender;
    
    if (search) {
      whereClause.fullName = {
        [Op.like]: `%${search}%`
      };
    }

    const students = await Student.findAll({
      where: whereClause,
      include: [
        { model: Class, attributes: ['id', 'name', 'room'] },
        { model: Parent, as: 'parents', through: { attributes: [] } }
      ],
      order: [['fullName', 'ASC']]
    });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error('[Student Controller] GetStudents error:', error);
    res.status(500).json({ success: false, message: 'Server error loading students.', error: error.message });
  }
};

// @desc    Get single student profile
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: Class, attributes: ['id', 'name', 'room'] },
        { model: Parent, as: 'parents', through: { attributes: [] } },
        { 
          model: MedicalRecord, 
          as: 'medicalRecord',
          include: [{ model: Allergy, as: 'allergies' }]
        },
        { model: PickupAuthorization, as: 'pickupAuthorizations' }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('[Student Controller] GetStudentById error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

// @desc    Create a student profile
// @route   POST /api/students
// @access  Private (Admin / Staff)
const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      classId,
      admissionDate,
      emergencyNotes,
      parentIds, // Array of Parent IDs
      medicalConditions,
      emergencyProcedures,
      healthNotes,
      allergies // Array of { allergen, severity, reaction, treatment }
    } = req.body;

    // Generate unique student ID
    const studentCount = await Student.count();
    const studentId = `STUDENT-${String(studentCount + 1).padStart(4, '0')}`;

    const student = await Student.create({
      studentId,
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      classId: classId || null,
      admissionDate: admissionDate || new Date(),
      emergencyNotes,
      studentPhoto: req.body.studentPhoto || null
    });

    // Create medical record
    const medRecord = await MedicalRecord.create({
      studentId: student.id,
      medicalConditions: medicalConditions || '',
      emergencyProcedures: emergencyProcedures || '',
      healthNotes: healthNotes || ''
    });

    // Create allergies if provided
    if (allergies && allergies.length > 0) {
      const allergyPromises = allergies.map(allergy => 
        Allergy.create({
          medicalRecordId: medRecord.id,
          allergen: allergy.allergen,
          severity: allergy.severity || 'Low',
          reaction: allergy.reaction || '',
          treatment: allergy.treatment || ''
        })
      );
      await Promise.all(allergyPromises);
    }

    // Associate Parents if provided
    if (parentIds && parentIds.length > 0) {
      const parents = await Parent.findAll({ where: { id: parentIds } });
      await student.addParents(parents);
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'STUDENT_CREATE',
      details: `Created student: ${fullName} (${studentId})`
    });

    res.status(201).json({ success: true, message: 'Student created successfully.', data: student });
  } catch (error) {
    console.error('[Student Controller] CreateStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error creating student.', error: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Admin / Teacher / Staff)
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const {
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      classId,
      admissionDate,
      emergencyNotes,
      status,
      parentIds,
      medicalConditions,
      emergencyProcedures,
      healthNotes
    } = req.body;

    await student.update({
      fullName: fullName || student.fullName,
      dateOfBirth: dateOfBirth || student.dateOfBirth,
      gender: gender || student.gender,
      bloodGroup: bloodGroup || student.bloodGroup,
      address: address || student.address,
      classId: classId !== undefined ? classId : student.classId,
      admissionDate: admissionDate || student.admissionDate,
      emergencyNotes: emergencyNotes || student.emergencyNotes,
      status: status || student.status,
      studentPhoto: req.body.studentPhoto || student.studentPhoto
    });

    // Update medical record details
    const medRecord = await MedicalRecord.findOne({ where: { studentId: student.id } });
    if (medRecord) {
      await medRecord.update({
        medicalConditions: medicalConditions !== undefined ? medicalConditions : medRecord.medicalConditions,
        emergencyProcedures: emergencyProcedures !== undefined ? emergencyProcedures : medRecord.emergencyProcedures,
        healthNotes: healthNotes !== undefined ? healthNotes : medRecord.healthNotes
      });
    }

    // Sync parents if provided
    if (parentIds !== undefined) {
      const parents = await Parent.findAll({ where: { id: parentIds } });
      await student.setParents(parents);
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'STUDENT_UPDATE',
      details: `Updated student details for: ${student.fullName} (${student.studentId})`
    });

    res.json({ success: true, message: 'Student profile updated successfully.', data: student });
  } catch (error) {
    console.error('[Student Controller] UpdateStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error updating student profile.', error: error.message });
  }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private (Admin Only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const name = student.fullName;
    const sid = student.studentId;

    await student.destroy();

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'STUDENT_DELETE',
      details: `Deleted student: ${name} (${sid})`
    });

    res.json({ success: true, message: 'Student profile deleted successfully.' });
  } catch (error) {
    console.error('[Student Controller] DeleteStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting student.' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
