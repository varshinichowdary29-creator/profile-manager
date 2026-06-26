-- FirstCry Intellitots Preschool Database Schema (PostgreSQL & SQLite compatible)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "Users" (
  "id" VARCHAR(36) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL DEFAULT 'Parent',
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS "Classes" (
  "id" VARCHAR(36) PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "room" VARCHAR(255),
  "capacity" INTEGER DEFAULT 20,
  "teacherId" VARCHAR(36) REFERENCES "Users" ("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS "Students" (
  "id" VARCHAR(36) PRIMARY KEY,
  "studentId" VARCHAR(255) UNIQUE NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  "dateOfBirth" DATE NOT NULL,
  "gender" VARCHAR(50) NOT NULL,
  "bloodGroup" VARCHAR(10),
  "address" TEXT,
  "admissionDate" DATE NOT NULL,
  "studentPhoto" VARCHAR(255),
  "status" VARCHAR(20) DEFAULT 'Active',
  "emergencyNotes" TEXT,
  "classId" VARCHAR(36) REFERENCES "Classes" ("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 4. Parents Table
CREATE TABLE IF NOT EXISTS "Parents" (
  "id" VARCHAR(36) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "mobileNumber" VARCHAR(50) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "occupation" VARCHAR(255),
  "address" TEXT,
  "relationType" VARCHAR(50) NOT NULL,
  "emergencyContact" VARCHAR(50) NOT NULL,
  "alternativeContact" VARCHAR(50),
  "userId" VARCHAR(36) REFERENCES "Users" ("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 5. StudentParents Join Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS "StudentParents" (
  "StudentId" VARCHAR(36) REFERENCES "Students" ("id") ON DELETE CASCADE,
  "ParentId" VARCHAR(36) REFERENCES "Parents" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  PRIMARY KEY ("StudentId", "ParentId")
);

-- 6. Attendances Table
CREATE TABLE IF NOT EXISTS "Attendances" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "date" DATE NOT NULL,
  "status" VARCHAR(20) DEFAULT 'Present',
  "checkInTime" VARCHAR(50),
  "checkOutTime" VARCHAR(50),
  "remarks" TEXT,
  "studentId" VARCHAR(36) REFERENCES "Students" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 7. Fees Table
CREATE TABLE IF NOT EXISTS "Fees" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "dueDate" DATE NOT NULL,
  "status" VARCHAR(20) DEFAULT 'Unpaid',
  "paidAmount" DECIMAL(10, 2) DEFAULT 0.00,
  "studentId" VARCHAR(36) REFERENCES "Students" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS "Payments" (
  "id" VARCHAR(36) PRIMARY KEY,
  "amountPaid" DECIMAL(10, 2) NOT NULL,
  "paymentDate" TIMESTAMP NOT NULL,
  "paymentMethod" VARCHAR(50) NOT NULL,
  "transactionId" VARCHAR(255) UNIQUE NOT NULL,
  "receiptNumber" VARCHAR(255) UNIQUE NOT NULL,
  "feeId" VARCHAR(36) REFERENCES "Fees" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 9. MedicalRecords Table
CREATE TABLE IF NOT EXISTS "MedicalRecords" (
  "id" VARCHAR(36) PRIMARY KEY,
  "medicalConditions" TEXT,
  "emergencyProcedures" TEXT,
  "healthNotes" TEXT,
  "studentId" VARCHAR(36) REFERENCES "Students" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 10. Allergies Table
CREATE TABLE IF NOT EXISTS "Allergies" (
  "id" VARCHAR(36) PRIMARY KEY,
  "allergen" VARCHAR(255) NOT NULL,
  "severity" VARCHAR(50) NOT NULL DEFAULT 'Low',
  "reaction" TEXT,
  "treatment" TEXT,
  "medicalRecordId" VARCHAR(36) REFERENCES "MedicalRecords" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 11. PickupAuthorizations Table
CREATE TABLE IF NOT EXISTS "PickupAuthorizations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "guardianName" VARCHAR(255) NOT NULL,
  "relationToStudent" VARCHAR(50) NOT NULL,
  "phoneNumber" VARCHAR(50) NOT NULL,
  "guardianPhoto" VARCHAR(255),
  "isPrimary" BOOLEAN DEFAULT false,
  "notes" TEXT,
  "studentId" VARCHAR(36) REFERENCES "Students" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS "Notifications" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "category" VARCHAR(50) NOT NULL DEFAULT 'General',
  "userId" VARCHAR(36) REFERENCES "Users" ("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 13. Assessments Table
CREATE TABLE IF NOT EXISTS "Assessments" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "category" VARCHAR(50) NOT NULL,
  "date" DATE NOT NULL,
  "studentId" VARCHAR(36) REFERENCES "Students" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 14. ProgressReports Table
CREATE TABLE IF NOT EXISTS "ProgressReports" (
  "id" VARCHAR(36) PRIMARY KEY,
  "skillName" VARCHAR(255) NOT NULL,
  "score" INTEGER NOT NULL,
  "remarks" TEXT,
  "assessmentId" VARCHAR(36) REFERENCES "Assessments" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- 15. ActivityLogs Table
CREATE TABLE IF NOT EXISTS "ActivityLogs" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "action" VARCHAR(255) NOT NULL,
  "details" TEXT,
  "userId" VARCHAR(36) REFERENCES "Users" ("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS "idx_students_classId" ON "Students" ("classId");
CREATE INDEX IF NOT EXISTS "idx_attendances_date" ON "Attendances" ("date");
CREATE INDEX IF NOT EXISTS "idx_fees_studentId" ON "Fees" ("studentId");
CREATE INDEX IF NOT EXISTS "idx_payments_feeId" ON "Payments" ("feeId");
