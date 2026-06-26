const { sequelize } = require('../config/db');

// Import models
const User = require('./User');
const Class = require('./Class');
const Student = require('./Student');
const Parent = require('./Parent');
const Attendance = require('./Attendance');
const Fee = require('./Fee');
const Payment = require('./Payment');
const MedicalRecord = require('./MedicalRecord');
const Allergy = require('./Allergy');
const PickupAuthorization = require('./PickupAuthorization');
const Notification = require('./Notification');
const Assessment = require('./Assessment');
const ProgressReport = require('./ProgressReport');
const ActivityLog = require('./ActivityLog');

// Define Relationships

// 1. Class & Teacher (User)
Class.belongsTo(User, { as: 'Teacher', foreignKey: 'teacherId' });
User.hasMany(Class, { foreignKey: 'teacherId' });

// 2. Class & Student
Class.hasMany(Student, { foreignKey: 'classId', onDelete: 'SET NULL' });
Student.belongsTo(Class, { foreignKey: 'classId' });

// 3. Parent & User
Parent.belongsTo(User, { foreignKey: 'userId', onDelete: 'SET NULL' });
User.hasOne(Parent, { foreignKey: 'userId' });

// 4. Student & Parent (Many-to-Many)
Student.belongsToMany(Parent, { through: 'StudentParents', as: 'parents' });
Parent.belongsToMany(Student, { through: 'StudentParents', as: 'students' });

// 5. Student & Attendance
Student.hasMany(Attendance, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

// 6. Student & Fee
Student.hasMany(Fee, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Fee.belongsTo(Student, { foreignKey: 'studentId' });

// 7. Fee & Payment
Fee.hasMany(Payment, { foreignKey: 'feeId', onDelete: 'CASCADE' });
Payment.belongsTo(Fee, { foreignKey: 'feeId' });

// 8. Student & MedicalRecord
Student.hasOne(MedicalRecord, { foreignKey: 'studentId', onDelete: 'CASCADE', as: 'medicalRecord' });
MedicalRecord.belongsTo(Student, { foreignKey: 'studentId' });

// 9. MedicalRecord & Allergy
MedicalRecord.hasMany(Allergy, { foreignKey: 'medicalRecordId', onDelete: 'CASCADE', as: 'allergies' });
Allergy.belongsTo(MedicalRecord, { foreignKey: 'medicalRecordId' });

// 10. Student & PickupAuthorization
Student.hasMany(PickupAuthorization, { foreignKey: 'studentId', onDelete: 'CASCADE', as: 'pickupAuthorizations' });
PickupAuthorization.belongsTo(Student, { foreignKey: 'studentId' });

// 11. Student & Assessment
Student.hasMany(Assessment, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Assessment.belongsTo(Student, { foreignKey: 'studentId' });

// 12. Assessment & ProgressReport
Assessment.hasMany(ProgressReport, { foreignKey: 'assessmentId', onDelete: 'CASCADE', as: 'progressReports' });
ProgressReport.belongsTo(Assessment, { foreignKey: 'assessmentId' });

// 13. User & ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// 14. User & Notification (Creator)
Notification.belongsTo(User, { as: 'sender', foreignKey: 'userId', onDelete: 'SET NULL' });
User.hasMany(Notification, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Class,
  Student,
  Parent,
  Attendance,
  Fee,
  Payment,
  MedicalRecord,
  Allergy,
  PickupAuthorization,
  Notification,
  Assessment,
  ProgressReport,
  ActivityLog
};
