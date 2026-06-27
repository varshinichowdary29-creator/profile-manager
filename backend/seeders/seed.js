const { sequelize, User, Class, Student, Parent, Attendance, Fee, Payment, MedicalRecord, Allergy, PickupAuthorization, Notification, Assessment, ProgressReport, ActivityLog } = require('../models');

const seedData = async () => {
  try {
    // Clear and sync DB
    await sequelize.sync({ force: true });
    console.log('[Seeder] Database cleared and tables synced.');

    // 1. Create Users
    const superAdmin = await User.create({
      name: 'Radhika Sharma',
      email: 'superadmin@intellitots.com',
      password: 'password123',
      role: 'Super Admin'
    });

    const schoolAdmin = await User.create({
      name: 'Aditya Verma',
      email: 'admin@intellitots.com',
      password: 'password123',
      role: 'School Admin'
    });

    const teacher = await User.create({
      name: 'Meera Sen',
      email: 'teacher@intellitots.com',
      password: 'password123',
      role: 'Teacher'
    });

    const frontDesk = await User.create({
      name: 'Karan Malhotra',
      email: 'staff@intellitots.com',
      password: 'password123',
      role: 'Front Desk Staff'
    });

    const parentUser = await User.create({
      name: 'Siddharth Roy',
      email: 'parent@intellitots.com',
      password: 'password123',
      role: 'Parent'
    });

    console.log('[Seeder] Roles created successfully.');

    // 2. Create Classes
    const nursery = await Class.create({
      name: 'Nursery A',
      room: 'Room 101',
      capacity: 15,
      teacherId: teacher.id
    });

    const lkg = await Class.create({
      name: 'LKG B',
      room: 'Room 102',
      capacity: 20
    });

    const ukg = await Class.create({
      name: 'UKG A',
      room: 'Room 103',
      capacity: 20
    });

    console.log('[Seeder] Classes created.');

    // 3. Create Parents
    const parent1 = await Parent.create({
      userId: parentUser.id,
      name: 'Siddharth Roy',
      mobileNumber: '+91 98765 43210',
      email: 'parent@intellitots.com',
      occupation: 'Software Engineer',
      address: 'Apt 402, Skyline Residency, Sector 15, Gurgaon',
      relationType: 'Father',
      emergencyContact: '+91 98765 43211',
      alternativeContact: '+91 99999 88888'
    });

    const parent2 = await Parent.create({
      name: 'Anjali Roy',
      mobileNumber: '+91 98765 43211',
      email: 'anjali.roy@example.com',
      occupation: 'Architect',
      address: 'Apt 402, Skyline Residency, Sector 15, Gurgaon',
      relationType: 'Mother',
      emergencyContact: '+91 98765 43210'
    });

    const parent3 = await Parent.create({
      name: 'Vikram Singh',
      mobileNumber: '+91 98234 56789',
      email: 'vikram.singh@example.com',
      occupation: 'Doctor',
      address: 'Villa 12, Greens Enclave, Gurgaon',
      relationType: 'Father',
      emergencyContact: '+91 98234 56780'
    });

    console.log('[Seeder] Parent profiles created.');

    // 4. Create Students
    const student1 = await Student.create({
      studentId: 'STUDENT-0001',
      fullName: 'Aarav Roy',
      dateOfBirth: '2022-04-12', // 4 years old
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'Apt 402, Skyline Residency, Sector 15, Gurgaon',
      classId: nursery.id,
      admissionDate: '2025-06-01',
      emergencyNotes: 'Prone to dry throat, keep warm water bottles.'
    });

    const student2 = await Student.create({
      studentId: 'STUDENT-0002',
      fullName: 'Rhea Roy',
      dateOfBirth: '2023-08-25', // 2.5 years old
      gender: 'Female',
      bloodGroup: 'O+',
      address: 'Apt 402, Skyline Residency, Sector 15, Gurgaon',
      classId: nursery.id,
      admissionDate: '2025-06-01',
      emergencyNotes: 'Needs support during nap time.'
    });

    const student3 = await Student.create({
      studentId: 'STUDENT-0003',
      fullName: 'Kabir Singh',
      dateOfBirth: '2021-01-15', // 5 years old
      gender: 'Male',
      bloodGroup: 'A+',
      address: 'Villa 12, Greens Enclave, Gurgaon',
      classId: ukg.id,
      admissionDate: '2024-04-10',
      emergencyNotes: 'Allergic to peanut butter.'
    });

    const student4 = await Student.create({
      studentId: 'STUDENT-0004',
      fullName: 'Sanya Gupta',
      dateOfBirth: '2022-11-30',
      gender: 'Female',
      bloodGroup: 'B+',
      address: 'Sector 54, Gurgaon',
      classId: lkg.id,
      admissionDate: '2025-01-05'
    });

    // Link Parents & Students
    await student1.addParents([parent1, parent2]);
    await student2.addParents([parent1, parent2]);
    await student3.addParents([parent3]);

    console.log('[Seeder] Students created and mapped to parents.');

    // 5. Create Attendance Records
    const dates = ['2026-06-22', '2026-06-23', '2026-06-24'];
    for (const d of dates) {
      await Attendance.create({ studentId: student1.id, date: d, status: 'Present', checkInTime: '08:55 AM', checkOutTime: '03:32 PM' });
      await Attendance.create({ studentId: student2.id, date: d, status: 'Present', checkInTime: '09:05 AM', checkOutTime: '03:30 PM' });
      await Attendance.create({ studentId: student3.id, date: d, status: d === '2026-06-23' ? 'Absent' : 'Present', checkInTime: d === '2026-06-23' ? null : '08:45 AM', checkOutTime: d === '2026-06-23' ? null : '03:40 PM', remarks: d === '2026-06-23' ? 'Cold & fever' : '' });
      await Attendance.create({ studentId: student4.id, date: d, status: 'Present', checkInTime: '08:50 AM', checkOutTime: '03:25 PM' });
    }

    console.log('[Seeder] Attendance logs populated.');

    // 6. Create Fees and Payments
    const fee1 = await Fee.create({
      studentId: student1.id,
      title: 'Term 1 Tuition Fee',
      amount: 15000.00,
      dueDate: '2026-07-01',
      status: 'Paid',
      paidAmount: 15000.00
    });

    const fee2 = await Fee.create({
      studentId: student1.id,
      title: 'Transport Fee (Q2)',
      amount: 4500.00,
      dueDate: '2026-07-15',
      status: 'Unpaid',
      paidAmount: 0.00
    });

    const fee3 = await Fee.create({
      studentId: student3.id,
      title: 'Term 1 Tuition & Activity Fee',
      amount: 18500.00,
      dueDate: '2026-07-01',
      status: 'Partially Paid',
      paidAmount: 10000.00
    });

    const fee4 = await Fee.create({
      studentId: student4.id,
      title: 'Term 1 Tuition Fee',
      amount: 15000.00,
      dueDate: '2026-07-01',
      status: 'Unpaid',
      paidAmount: 0.00
    });

    // Payments logs
    await Payment.create({
      feeId: fee1.id,
      amountPaid: 15000.00,
      paymentMethod: 'Online',
      transactionId: 'TXN-902341235123',
      receiptNumber: 'RCPT-000001'
    });

    await Payment.create({
      feeId: fee3.id,
      amountPaid: 10000.00,
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-BK892348123',
      receiptNumber: 'RCPT-000002'
    });

    console.log('[Seeder] Invoice entries and payment lists created.');

    // 7. Medical Records and Allergies
    const medRec1 = await MedicalRecord.create({
      studentId: student1.id,
      medicalConditions: 'Eczema',
      emergencyProcedures: 'Apply prescription ointment (located in locker A2) if redness worsens.',
      healthNotes: 'Prone to skin irritation when dry.'
    });

    const medRec3 = await MedicalRecord.create({
      studentId: student3.id,
      medicalConditions: 'Mild Asthma',
      emergencyProcedures: 'Use emergency inhaler (Inhaler in front pocket of school bag) - 2 puffs under teacher supervision, notify parents immediately.',
      healthNotes: 'Requires inhaler during heavy active sports sessions.'
    });

    await Allergy.create({
      medicalRecordId: medRec1.id,
      allergen: 'Dairy Products',
      severity: 'Low',
      reaction: 'Mild hives on arms',
      treatment: 'Apply moisturizer lotion'
    });

    await Allergy.create({
      medicalRecordId: medRec3.id,
      allergen: 'Peanut Butter / Peanuts',
      severity: 'High',
      reaction: 'Anaphylaxis / Breathing issues',
      treatment: 'EpiPen administration and call 112/102 immediately'
    });

    console.log('[Seeder] Health and allergy records created.');

    // 8. Pickup Authorizations
    await PickupAuthorization.create({
      studentId: student1.id,
      name: 'Ramesh Roy',
      relationship: 'Grandfather',
      contactNumber: '+91 98888 77777',
      status: 'Authorized',
      pinCode: '1234'
    });

    await PickupAuthorization.create({
      studentId: student1.id,
      name: 'Geeta Roy',
      relationship: 'Grandmother',
      contactNumber: '+91 97777 66666',
      status: 'Authorized',
      pinCode: '5678'
    });

    await PickupAuthorization.create({
      studentId: student3.id,
      name: 'Amit Singh',
      relationship: 'Uncle',
      contactNumber: '+91 96666 55555',
      status: 'Authorized',
      pinCode: '9012'
    });

    console.log('[Seeder] Pickup guardians linked.');

    // 9. Notifications
    await Notification.create({
      title: 'FirstCry Intellitots Annual Sports Meet 2026',
      content: 'We are excited to announce our upcoming Annual Sports Meet scheduled for July 10th. Details of events and schedules will be sent next week. Parent participation is highly encouraged!',
      type: 'Announcement',
      recipientRole: 'All',
      userId: schoolAdmin.id
    });

    await Notification.create({
      title: 'Teacher Training Day - No Classes',
      content: 'Reminder that school will remain closed for all children on Friday, June 26th due to scheduled Teacher Training workshops.',
      type: 'Announcement',
      recipientRole: 'All',
      userId: schoolAdmin.id
    });

    await Notification.create({
      title: 'Urgent Medical Update Required',
      content: 'For teachers, please review the revised asthma guidelines for student Kabir Singh in the medical dashboard before the sports class tomorrow.',
      type: 'Alert',
      recipientRole: 'Teacher',
      userId: schoolAdmin.id
    });

    console.log('[Seeder] Notifications posted.');

    // 10. Assessments & Progress
    const assess1 = await Assessment.create({
      studentId: student1.id,
      title: 'Milestone Review Q2 - Fine Motor',
      category: 'Physical/Motor',
      date: '2026-06-20',
      teacherId: teacher.id
    });

    await ProgressReport.create({
      assessmentId: assess1.id,
      skillName: 'Holding Pencil/Crayon',
      score: 4,
      remarks: 'Aarav has developed a stable pincer grip. Colors inside the borders with minimal spill.'
    });

    await ProgressReport.create({
      assessmentId: assess1.id,
      skillName: 'Paper Scissors Cutting',
      score: 3,
      remarks: 'Needs minor guidance to cut along straight lines.'
    });

    await ProgressReport.create({
      assessmentId: assess1.id,
      skillName: 'Building Blocks Stacking',
      score: 5,
      remarks: 'Excellent balance skills. Easily stacks a 10-block tower.'
    });

    const assess2 = await Assessment.create({
      studentId: student1.id,
      title: 'Social Skills Evaluation',
      category: 'Social/Emotional',
      date: '2026-06-21',
      teacherId: teacher.id
    });

    await ProgressReport.create({
      assessmentId: assess2.id,
      skillName: 'Sharing Toys',
      score: 4,
      remarks: 'Shares items willingly during play group activities.'
    });

    await ProgressReport.create({
      assessmentId: assess2.id,
      skillName: 'Conflict Resolution',
      score: 4,
      remarks: 'Asks teachers for support rather than reacting when issues occur.'
    });

    console.log('[Seeder] Assessment scores logged.');

    // 11. Activity Logs
    await ActivityLog.create({ userId: schoolAdmin.id, action: 'SYSTEM_STARTUP', details: 'Initialized data seeding checklist.' });
    await ActivityLog.create({ userId: schoolAdmin.id, action: 'CLASS_CREATE', details: 'Created Class Nursery A room.' });
    await ActivityLog.create({ userId: schoolAdmin.id, action: 'STUDENT_CREATE', details: 'Registered Aarav Roy (STUDENT-0001).' });

    console.log('[Seeder] Audit logs created.');
    console.log('[Seeder] DATABASE SEEDING COMPLETED SUCCESSFUL!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder] Seeding failed with error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
