-- Seed Data for FirstCry Intellitots Preschool Database

-- 1. Insert Users (Password hashes are for 'password123' via bcrypt)
INSERT INTO "Users" ("id", "name", "email", "password", "role", "createdAt", "updatedAt") VALUES
('user-admin-1', 'Radhika Sharma', 'superadmin@intellitots.com', '$2a$10$wN1FwDbgF.tqW9PzPvxJde5/W0Qe97c9b8rT.W.iY6L1tL2yF.xU.', 'Super Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-admin-2', 'Aditya Verma', 'admin@intellitots.com', '$2a$10$wN1FwDbgF.tqW9PzPvxJde5/W0Qe97c9b8rT.W.iY6L1tL2yF.xU.', 'School Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-teacher-1', 'Meera Sen', 'teacher@intellitots.com', '$2a$10$wN1FwDbgF.tqW9PzPvxJde5/W0Qe97c9b8rT.W.iY6L1tL2yF.xU.', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-parent-1', 'Siddharth Roy', 'parent@intellitots.com', '$2a$10$wN1FwDbgF.tqW9PzPvxJde5/W0Qe97c9b8rT.W.iY6L1tL2yF.xU.', 'Parent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Insert Classes
INSERT INTO "Classes" ("id", "name", "room", "capacity", "teacherId", "createdAt", "updatedAt") VALUES
('class-nursery', 'Nursery A', 'Room 101', 15, 'user-teacher-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('class-lkg', 'LKG B', 'Room 102', 20, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('class-ukg', 'UKG A', 'Room 103', 20, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert Parents
INSERT INTO "Parents" ("id", "name", "mobileNumber", "email", "occupation", "address", "relationType", "emergencyContact", "alternativeContact", "userId", "createdAt", "updatedAt") VALUES
('parent-roy-1', 'Siddharth Roy', '+91 98765 43210', 'parent@intellitots.com', 'Software Engineer', 'Apt 402, Skyline Residency, Sector 15, Gurgaon', 'Father', '+91 98765 43211', '+91 99999 88888', 'user-parent-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('parent-roy-2', 'Anjali Roy', '+91 98765 43211', 'anjali.roy@example.com', 'Architect', 'Apt 402, Skyline Residency, Sector 15, Gurgaon', 'Mother', '+91 98765 43210', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Insert Students
INSERT INTO "Students" ("id", "studentId", "fullName", "dateOfBirth", "gender", "bloodGroup", "address", "admissionDate", "studentPhoto", "status", "emergencyNotes", "classId", "createdAt", "updatedAt") VALUES
('student-aarav', 'STUDENT-0001', 'Aarav Roy', '2022-04-12', 'Male', 'O+', 'Apt 402, Skyline Residency, Sector 15, Gurgaon', '2025-06-01', NULL, 'Active', 'Prone to dry throat, keep warm water bottles.', 'class-nursery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student-rhea', 'STUDENT-0002', 'Rhea Roy', '2023-08-25', 'Female', 'O+', 'Apt 402, Skyline Residency, Sector 15, Gurgaon', '2025-06-01', NULL, 'Active', 'Needs support during nap time.', 'class-nursery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student-sanya', 'STUDENT-0004', 'Sanya Gupta', '2022-11-30', 'Female', 'B+', 'Sector 54, Gurgaon', '2025-01-05', NULL, 'Active', NULL, 'class-lkg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Link Parents and Students
INSERT INTO "StudentParents" ("StudentId", "ParentId", "createdAt", "updatedAt") VALUES
('student-aarav', 'parent-roy-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student-aarav', 'parent-roy-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student-rhea', 'parent-roy-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student-rhea', 'parent-roy-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Insert Attendances
INSERT INTO "Attendances" ("date", "status", "checkInTime", "checkOutTime", "remarks", "studentId", "createdAt", "updatedAt") VALUES
('2026-06-25', 'Present', '08:55 AM', '03:32 PM', NULL, 'student-aarav', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2026-06-25', 'Present', '09:05 AM', '03:30 PM', NULL, 'student-rhea', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2026-06-25', 'Present', '08:50 AM', '03:25 PM', NULL, 'student-sanya', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Insert Medical Records
INSERT INTO "MedicalRecords" ("id", "medicalConditions", "emergencyProcedures", "healthNotes", "studentId", "createdAt", "updatedAt") VALUES
('med-aarav', 'Mild seasonal asthma', 'Administer inhaler if breathing becomes labored.', 'Keep away from damp areas.', 'student-aarav', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. Insert Allergies
INSERT INTO "Allergies" ("id", "allergen", "severity", "reaction", "treatment", "medicalRecordId", "createdAt", "updatedAt") VALUES
('allergy-dust', 'Dust/Pollen', 'Low', 'Sneezing, runny eyes', 'Clean face with cool water, give antihistamine if severe', 'med-aarav', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 9. Insert Pickup Authorizations
INSERT INTO "PickupAuthorizations" ("id", "guardianName", "relationToStudent", "phoneNumber", "guardianPhoto", "isPrimary", "notes", "studentId", "createdAt", "updatedAt") VALUES
('pickup-guardian-1', 'Rajesh Roy', 'Grandfather', '+91 94440 12345', NULL, 1, 'Authorized for Friday pickups', 'student-aarav', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 10. Insert Fees
INSERT INTO "Fees" ("id", "title", "amount", "dueDate", "status", "paidAmount", "studentId", "createdAt", "updatedAt") VALUES
('fee-aarav-t1', 'Term 1 Tuition Fee', 15000.00, '2026-07-01', 'Paid', 15000.00, 'student-aarav', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('fee-aarav-tr', 'Transport Fee (Q2)', 4500.00, '2026-07-15', 'Unpaid', 0.00, 'student-aarav', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11. Insert Payments
INSERT INTO "Payments" ("id", "amountPaid", "paymentDate", "paymentMethod", "transactionId", "receiptNumber", "feeId", "createdAt", "updatedAt") VALUES
('payment-aarav-t1', 15000.00, CURRENT_TIMESTAMP, 'Online', 'TXN-98234720938', 'REC-0001', 'fee-aarav-t1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
