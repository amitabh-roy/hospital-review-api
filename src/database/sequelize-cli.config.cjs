/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { loadEnvFile } = require('node:process');

const envFilePath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(envFilePath)) {
  loadEnvFile(envFilePath);
}

function getDatabaseDialectOptions() {
  if (process.env.DB_SSL !== 'true') {
    return {};
  }

  return {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
}

const baseConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  define: {
    underscored: true,
  },
  ...getDatabaseDialectOptions(),
};

module.exports = {
  development: {
    ...baseConfig,
    database: process.env.DB_NAME || 'opencurtain_db',
    logging: process.env.DB_LOGGING === 'true',
  },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME || 'opencurtain_db_test',
    logging: false,
  },
  production: {
    ...baseConfig,
    database: process.env.DB_NAME || 'opencurtain_db',
    logging: false,
  },
};
