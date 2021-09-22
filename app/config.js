// Import path
const path = require("path");

// Require dotenv module
const dotenv = require("dotenv");
// use dotenv
dotenv.config();

module.exports = {
  // Read variable SERVICE_NAME in file .env
  serviceName: process.env.SERVICE_NAME,

  // Secret key login with JWT
  secretKey: process.env.SECRET_KEY,

  // Database config
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbPort: process.env.DB_PORT,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,

  // Config root path name
  rootPath: path.resolve(__dirname, ".."),
};
