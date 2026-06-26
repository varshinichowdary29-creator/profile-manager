# FirstCry Intellitots - Backend API

The Express REST API server backing the Student Profile Manager application.

## Getting Started

### Prerequisites
* Node.js v18+

### Setup
1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. **Database Seeding:**
   Seed the sqlite database:
   ```bash
   npm run seed
   ```

4. **Run Server:**
   * Run in development mode (with hot reloading via nodemon):
     ```bash
     npm run dev
     ```
   * Run in production mode:
     ```bash
     npm start
     ```

## Automated Tests

Run the test suite:
```bash
npm test
```

## Structure
* `config/`: Database configurations and Sequelize clients.
* `controllers/`: Request handler business logic.
* `middleware/`: Auth gates and express route interceptors.
* `models/`: Database model schemas (Sequelize).
* `routes/`: Express endpoint routing schemas.
* `seeders/`: Database seed scripts.
