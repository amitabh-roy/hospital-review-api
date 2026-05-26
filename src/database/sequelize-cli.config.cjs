/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { loadEnvFile } = require('node:process');

const envFilePath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(envFilePath)) {
  loadEnvFile(envFilePath);
}

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hospital_reviews',
    logging: process.env.DB_LOGGING === 'true',
    define: {
      underscored: true,
    },
  },
  test: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hospital_reviews_test',
    logging: false,
    define: {
      underscored: true,
    },
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hospital_reviews',
    logging: false,
    define: {
      underscored: true,
    },
  },
};
