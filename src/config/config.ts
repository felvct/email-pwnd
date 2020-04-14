import defaultConfig from './config.json';

const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  ENDPOINT: process.env.BREACHED_ENDPOINT || 'https://haveibeenpwned.com/api/v3/breachedaccount',
  API_KEY: process.env.API_KEY || defaultConfig.apiKey,
  APP_NAME: process.env.APP_NAME || 'email-pwnd',
  EMAIL: {
    host: process.env.EMAIL_HOST || defaultConfig.emailSettings.host,
    port: process.env.EMAIL_PORT || defaultConfig.emailSettings.port,
    user: process.env.EMAIL_USER || defaultConfig.emailSettings.user,
    password: process.env.EMAIL_PASSWORD || defaultConfig.emailSettings.password,
  },
};
