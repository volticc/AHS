function getEnvVariable(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`FATAL ERROR: Environment variable ${key} is not defined.`);
  }

  return value;
}

export const config = {
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
};
