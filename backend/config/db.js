const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'intellitots_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './database.sqlite',
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected successfully via Sequelize (${dialect} dialect).`);
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
