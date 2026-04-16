require('dotenv').config();
const { sequelize, User } = require('../models');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connection ok for seeding');

    // Utilisateurs de démo à créer
    const demoUsers = [
      {
        email: 'admin@mairie.mg',
        firstName: 'Administrateur',
        lastName: 'Système',
        password: 'Admin@123',
        role: 'ADMIN'
      },
      {
        email: 'agent@mairie.mg',
        firstName: 'Jean',
        lastName: 'Agent',
        password: 'Agent@123',
        role: 'FIELD_AGENT'
      },
      {
        email: 'chief@mairie.mg',
        firstName: 'Pierre',
        lastName: 'Chef',
        password: 'Chief@123',
        role: 'SERVICE_HEAD'
      },
      {
        email: 'secretary@mairie.mg',
        firstName: 'Marie',
        lastName: 'Secrétaire',
        password: 'Secretary@123',
        role: 'SECRETARY'
      },
      {
        email: 'director@mairie.mg',
        firstName: 'André',
        lastName: 'Directeur',
        password: 'Director@123',
        role: 'DIRECTOR'
      }
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (!existing) {
        const user = await User.create(userData);
        logger.info(`✅ Seeded user: ${user.email} (${user.role})`);
      } else {
        logger.info(`⚠️  User already exists: ${userData.email}`);
      }
    }

    logger.info('✅ Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
