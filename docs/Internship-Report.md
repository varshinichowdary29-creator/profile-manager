# FirstCry Intellitots Internship Project Report

**Project Title:** Class-wise Student Profile Manager  
**Intern Name:** [Intern Name]  
**Organization:** FirstCry Intellitots  
**Date:** June 2026  

---

## 1. Project Overview
The Class-wise Student Profile Manager is an enterprise preschool & daycare management application designed for FirstCry Intellitots. The system streamlines parent communication, attendance tracking, billing, medical logging, and student progress folders under a secure, role-based access control interface.

---

## 2. Technology Stack & Rationale
* **Frontend:** React.js, Vite, TailwindCSS, Framer Motion, Lucide icons, Chart.js.
  * *Rationale:* React offers modular components. Vite ensures ultra-fast development builds.
* **Backend:** Node.js, Express.js, Sequelize ORM.
  * *Rationale:* Node.js handles asynchronous API queries. Sequelize provides abstraction over SQL query layers.
* **Database:** SQLite (development), PostgreSQL (production-ready).
  * *Rationale:* Light file-based sqlite database for fast local setups with compatibility for PostgreSQL on cloud environments.

---

## 3. Key Achievements & Dynamic Features
* **Role-Based Access Control (RBAC):** Restricts interface tabs and read/write actions based on user type (Super Admin, School Admin, Teacher, Front Desk Staff, and Parent).
* **Roster Synchronization:** Refactored static class lists to dynamic database-backed routing mapping matching student UUID associations.
* **Bulk Roster Registers:** Enabled mass-marking attendance sheets and multi-student invoice creations.
* **Health Folders:** Linked student folders to medical allergy profiles and emergency care directives.

---

## 4. Visual Diagrams
* **System Architecture:** Visual blueprint details are saved in [Architecture.png](Architecture.png).
* **Database ER-Diagram:** Schema table mappings are saved in [ER-Diagram.png](../database/ER-Diagram.png).

---

## 5. Deployment Guidelines
Refer to the [Root README](../README.md) for local run commands, Docker orchestrations, and cloud deployment steps (Vercel + Render).
