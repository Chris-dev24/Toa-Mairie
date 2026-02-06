const { sequelize } = require('../models');
const logger = require('../utils/logger');
require('dotenv').config();

const runMigrations = async () => {
  try {
    // For now use sync to ensure tables exist. Replace with proper migrations later.
    await sequelize.sync({ alter: true });
    logger.info('Migrations applied (sequelize.sync alter:true)');
    process.exit(0);
  } catch (err) {
    logger.error('Migration run failed:', err);
    process.exit(1);
  }
};

runMigrations();
