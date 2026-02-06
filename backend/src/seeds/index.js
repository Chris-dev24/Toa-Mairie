require('dotenv').config();
const { sequelize, User } = require('../models');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connection ok for seeding');

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@toamasina.local';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    const existing = await User.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const admin = await User.create({
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'Toamasina',
        password: adminPassword,
        role: 'ADMIN'
      });
      logger.info(`Seeded admin user: ${admin.email}`);
    } else {
      logger.info('Admin user already exists, skipping seed');
    }

    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
