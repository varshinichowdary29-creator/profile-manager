# FirstCry Intellitots REST API Documentation

This document describes the API endpoints exposed by the FirstCry Intellitots backend server. All routes (except login/register) require JWT authorization via the `Authorization: Bearer <token>` header.

---

## Authentication Endpoints

### 1. Register User
* **URL:** `/api/auth/register`
* **Method:** `POST`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Parent",
    "parentDetails": {
      "mobileNumber": "+91 99999 88888",
      "relationType": "Father",
      "emergencyContact": "+91 99999 88889"
    }
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "uuid-user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Parent"
    }
  }
  ```

### 2. Login User
* **URL:** `/api/auth/login`
* **Method:** `POST`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "admin@intellitots.com",
    "password": "password123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "uuid-admin-123",
      "name": "Aditya Verma",
      "email": "admin@intellitots.com",
      "role": "School Admin"
    }
  }
  ```

---

## Classrooms Endpoints

### 1. Get All Classes
* **URL:** `/api/classes`
* **Method:** `GET`
* **Access:** Private
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "id": "class-nursery",
        "name": "Nursery A",
        "room": "Room 101",
        "capacity": 15
      }
    ]
  }
  ```

---

## Student Roster Endpoints

### 1. Get Students
* **URL:** `/api/students`
* **Method:** `GET`
* **Access:** Private
* **Query Parameters:**
  * `classId` (Optional) - Filter by class UUID
  * `status` (Optional) - Filter by status (`Active`/`Inactive`)
  * `search` (Optional) - Filter by full name substring
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "student-aarav",
        "studentId": "STUDENT-0001",
        "fullName": "Aarav Roy",
        "classId": "class-nursery",
        "Class": { "name": "Nursery A" }
      }
    ]
  }
  ```

### 2. Create Student Profile
* **URL:** `/api/students`
* **Method:** `POST`
* **Access:** Private (Admin / Staff)
* **Request Body:**
  ```json
  {
    "fullName": "Aanya Sharma",
    "dateOfBirth": "2023-01-15",
    "gender": "Female",
    "bloodGroup": "O+",
    "address": "Villa 15, Sector 2, Gurgaon",
    "classId": "class-nursery",
    "parentIds": ["parent-roy-1"]
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Student created successfully.",
    "data": {
      "id": "student-aanya",
      "studentId": "STUDENT-0005",
      "fullName": "Aanya Sharma"
    }
  }
  ```

---

## Attendance Endpoints

### 1. Retrieve Roster
* **URL:** `/api/attendance`
* **Method:** `GET`
* **Access:** Private
* **Query Parameters:**
  * `classId` (Required) - Class UUID
  * `date` (Required) - Date string (`YYYY-MM-DD`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "date": "2026-06-25",
    "data": [
      {
        "studentId": "student-aarav",
        "fullName": "Aarav Roy",
        "status": "Present",
        "checkInTime": "08:55 AM",
        "checkOutTime": "03:32 PM"
      }
    ]
  }
  ```

### 2. Mark Attendance (Bulk)
* **URL:** `/api/attendance`
* **Method:** `POST`
* **Access:** Private (Admin / Teacher / Staff)
* **Request Body:**
  ```json
  {
    "date": "2026-06-25",
    "attendanceList": [
      {
        "studentId": "student-aarav",
        "status": "Present",
        "checkInTime": "08:55 AM",
        "checkOutTime": "03:32 PM",
        "remarks": ""
      }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Attendance updated successfully."
  }
  ```
