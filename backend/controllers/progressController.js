const { Assessment, ProgressReport, Student, ActivityLog } = require('../models');

// @desc    Get developmental logs for a student
// @route   GET /api/progress/:studentId
// @access  Private
const getStudentAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.findAll({
      where: { studentId: req.params.studentId },
      include: [
        { model: ProgressReport, as: 'progressReports' }
      ],
      order: [['date', 'DESC']]
    });

    res.json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    console.error('[Progress Controller] GetStudentAssessments error:', error);
    res.status(500).json({ success: false, message: 'Server error loading learning development history.' });
  }
};

// @desc    Record teacher assessment
// @route   POST /api/progress
// @access  Private (Admin / Teacher)
const createAssessment = async (req, res) => {
  try {
    const { studentId, title, category, date, reports } = req.body; // reports array: [{ skillName, score, remarks }]

    if (!studentId || !title || !category || !reports || !Array.isArray(reports)) {
      return res.status(400).json({ success: false, message: 'Missing parameters in evaluation payload.' });
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const assessment = await Assessment.create({
      studentId,
      title,
      category,
      date: date || new Date(),
      teacherId: req.user.id
    });

    const reportPromises = reports.map(r => 
      ProgressReport.create({
        assessmentId: assessment.id,
        skillName: r.skillName,
        score: r.score,
        remarks: r.remarks || ''
      })
    );

    await Promise.all(reportPromises);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'ASSESSMENT_CREATE',
      details: `Added ${category} assessment for student '${student.fullName}': ${title}`
    });

    const finalAssessment = await Assessment.findByPk(assessment.id, {
      include: [{ model: ProgressReport, as: 'progressReports' }]
    });

    res.status(201).json({ success: true, message: 'Milestone assessment registered.', data: finalAssessment });
  } catch (error) {
    console.error('[Progress Controller] CreateAssessment error:', error);
    res.status(500).json({ success: false, message: 'Server error recording assessment.', error: error.message });
  }
};

module.exports = { getStudentAssessments, createAssessment };
