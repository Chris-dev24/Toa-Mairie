const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../toa_mairie.db'),
    logging: console.log,
    operatorsAliases: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'toa_mairie_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
