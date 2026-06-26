# FirstCry Intellitots - Class-wise Student Profile Manager

An enterprise-grade, modern preschool and daycare profile management platform built with React, Express, and Sequelize supporting zero-config SQLite local development and high-capacity PostgreSQL production deployments.

---

## Project Overview

### Company Name
**FirstCry Intellitots**

### Project Description
This repository contains the **Class-wise Student Profile Manager** built for FirstCry Intellitots. The system streamlines parent communication, attendance tracking, billing, medical logging, and student progress folders under a secure, role-based access control interface.

---

## Features

1. **Authentication & Session Manager**: Role-Based Access Control (RBAC) supporting Super Admin, School Admin, Teacher, Parent, and Front Desk Staff.
2. **Student Directory**: Full profile CRUD (blood groups, ages, classes, emergency details, medical dossiers, parent associations).
3. **Parent Management Portal**: Links guardian profiles (Father/Mother/Guardian) with contact records and alternative lines.
4. **Checkout & Pickup Authorization**: PIN-secured guardian authorizations, checkout approvals, and activity logs.
5. **Class-wise Attendance Sheet**: Bulk roll-call check-in checklists, presence indicators, time counters, and remarks.
6. **Fees & Online Billing**: Outstanding dues summary, simulated payment checkout processing, and transaction receipts.
7. **Health & Medical Alerts**: Allergens checklist (Dairy, Peanut, Gluten, etc.), severity tags, and emergency action checklists.
8. **Development Logs**: Skill dimensions radar charts (Cognitive, Social, Language, Physical) and progress charts.
9. **School Announcements Board**: Bulletin notice board publishing alerts and targeted posts.

---

## Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Chart.js, Axios, React Router.
* **Backend**: Node.js, Express.js.
* **Database ORM**: Sequelize supporting **PostgreSQL** and **SQLite** dialects.

---

## Architecture Diagram

The system architecture utilizes a React Single Page Application (SPA) communicating over REST APIs with an Express Server backing onto a SQLite/PostgreSQL Database via Sequelize ORM.

You can view the full architecture diagram at [docs/Architecture.png](docs/Architecture.png).

---

## Folder Structure

```
Class-wise-Student-Profile-Manager/
│
├── frontend/                  # React Client Code base
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                   # Express REST API Code base
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── database/                  # SQL Schemas and DB diagrams
│   ├── schema.sql
│   ├── seed.sql
│   └── ER-Diagram.png
│
├── docs/                      # Documentation resources
│   ├── Architecture.png
│   ├── API-Documentation.md
│   ├── Screenshots/
│   └── Internship-Report.pdf
│
├── .gitignore
├── .env.example
├── LICENSE
├── package.json
└── README.md
```

---

## Installation Steps

### Prerequisites
* Node.js (v18 or higher)
* Git

### Local Setup
1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd Preschool
   ```

2. **Install All Dependencies:**
   Install dependencies for the root, frontend, and backend packages using the workspace utility:
   ```bash
   npm run install:all
   ```

3. **Database Seeding:**
   Seed the sqlite database with demo parent/student accounts:
   ```bash
   npm run seed --prefix backend
   ```

4. **Run Concurrently:**
   Run both backend API and frontend Vite servers concurrently:
   ```bash
   npm run dev
   ```
   * **Frontend URL:** [http://localhost:5173/](http://localhost:5173/)
   * **Backend URL:** [http://localhost:5000/](http://localhost:5000/)

---

## User Accounts & Credentials (Seeded)

The database comes pre-seeded with realistic sample records. You can log in using these preset accounts:

| Role | Username | Password | Actions & Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@intellitots.com` | `password123` | Complete platform management, full CRUD, database audit logs. |
| **School Admin** | `admin@intellitots.com` | `password123` | Roster logs, class setups, fee assignments, communication. |
| **Teacher** | `teacher@intellitots.com` | `password123` | Class registers, milestone assessments, medical lists. |
| **Parent** | `parent@intellitots.com` | `password123` | Read child profile, pay invoice dues, print receipt, review radar milestone charts. |
| **Front Desk Staff** | `staff@intellitots.com` | `password123` | Sign-in logs, emergency notes, check-out PIN authorizations. |

---

## Database Setup & ER-Diagram

The database schema utilizes Sequelize models. The DDL script is located in [database/schema.sql](database/schema.sql) and the seed dataset is located in [database/seed.sql](database/seed.sql).

Refer to the database ER-Diagram at [database/ER-Diagram.png](database/ER-Diagram.png).

---

## API Documentation

The REST endpoints are fully documented in [docs/API-Documentation.md](docs/API-Documentation.md).

---

## Environment Variables

See the environment variable specifications in the respective `.env.example` templates:
* **Root Configuration:** [.env.example](.env.example)
* **Frontend Config:** [frontend/.env.example](frontend/.env.example)
* **Backend Config:** [backend/.env.example](backend/.env.example)

---

## Deployment

### Frontend (Vercel / Netlify)
1. Set the environment variable `VITE_API_URL` to point to your hosted backend API URL.
2. Build command: `npm run build`
3. Publish directory: `dist`

### Backend (Render / Railway)
1. Configure host settings and environment variables: `PORT`, `JWT_SECRET`, `NODE_ENV`.
2. Connect to a PostgreSQL instance by updating the connection parameters (`DB_DIALECT=postgres`).
3. Set the start script: `node server.js`

---

## Docker Support

Run the application using Docker Compose:
```bash
docker-compose up --build
```
This builds and starts both the frontend container and the backend API server.

---

## Future Scope

1. **AI-Driven Analytics Assistant:** Integrate OpenAI to provide child performance summaries and milestone reports.
2. **SMTP Messaging alerts:** Hook up direct email alerts for attendance absences.
3. **PWA Support:** Convert the app to a Progressive Web App (PWA) to allow offline caching of registers.

---

## Author
* **Preschool Development Team**
* FirstCry Intellitots Internship Program.

---

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
