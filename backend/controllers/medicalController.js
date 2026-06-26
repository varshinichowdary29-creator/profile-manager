const { MedicalRecord, Allergy, Student, Class, ActivityLog } = require('../models');

// @desc    Get all medical records and allergies
// @route   GET /api/medical
// @access  Private
const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({
      include: [
        { 
          model: Student, 
          attributes: ['id', 'fullName', 'studentId', 'bloodGroup'],
          include: [{ model: Class, attributes: ['name'] }]
        },
        { model: Allergy, as: 'allergies' }
      ]
    });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error('[Medical Controller] GetMedicalRecords error:', error);
    res.status(500).json({ success: false, message: 'Server error loading medical data.' });
  }
};

// @desc    Update allergies and emergency actions
// @route   PUT /api/medical/:id
// @access  Private (Admin / Teacher / Staff)
const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [{ model: Student }]
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    const { medicalConditions, emergencyProcedures, healthNotes, allergies } = req.body;

    await record.update({
      medicalConditions: medicalConditions !== undefined ? medicalConditions : record.medicalConditions,
      emergencyProcedures: emergencyProcedures !== undefined ? emergencyProcedures : record.emergencyProcedures,
      healthNotes: healthNotes !== undefined ? healthNotes : record.healthNotes
    });

    // Handle updating allergies list (delete and re-create for simplicity)
    if (allergies && Array.isArray(allergies)) {
      await Allergy.destroy({ where: { medicalRecordId: record.id } });

      const allergyPromises = allergies.map(a => 
        Allergy.create({
          medicalRecordId: record.id,
          allergen: a.allergen,
          severity: a.severity || 'Low',
          reaction: a.reaction || '',
          treatment: a.treatment || ''
        })
      );
      await Promise.all(allergyPromises);
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'MEDICAL_UPDATE',
      details: `Updated medical and allergy records for student: ${record.Student ? record.Student.fullName : 'Unknown'}`
    });

    const updatedRecord = await MedicalRecord.findByPk(record.id, {
      include: [{ model: Allergy, as: 'allergies' }]
    });

    res.json({ success: true, message: 'Medical files updated successfully.', data: updatedRecord });
  } catch (error) {
    console.error('[Medical Controller] UpdateMedicalRecord error:', error);
    res.status(500).json({ success: false, message: 'Server error updating medical files.', error: error.message });
  }
};

module.exports = { getMedicalRecords, updateMedicalRecord };
