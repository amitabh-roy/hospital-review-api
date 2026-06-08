/** RDS PostgreSQL requires SSL; local Postgres usually does not. */
export function getDatabaseDialectOptions():
  | { dialectOptions: { ssl: { require: true; rejectUnauthorized: false } } }
  | Record<string, never> {
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
