// Import module mongo
const mongoose = require("mongoose");

// Import configuration from file 'app/config.js'
const { dbHost, dbName, dbPort, dbUser, dbPass } = require("../app/config");

// Connect to MongoDB
mongoose.connect(
  `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
);

// Declaration connection to const 'db'
const db = mongoose.connection;

// Export db agar bisa digunakan file lain
module.exports = db;
