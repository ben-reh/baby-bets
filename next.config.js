/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DYNAMODB_REGION: process.env.DYNAMODB_REGION || 'us-east-1',
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE || 'baby-bets-guesses',
    DYNAMODB_ACCESS_KEY_ID: process.env.DYNAMODB_ACCESS_KEY_ID || '',
    DYNAMODB_SECRET_ACCESS_KEY: process.env.DYNAMODB_SECRET_ACCESS_KEY || '',
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
