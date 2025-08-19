require("dotenv").config();
const path = require("path");

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    migrationStorageTableName: "sequelize_meta",
    migrationStoragePath: path.resolve(__dirname, "../src/database/migrations"),
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    migrationStoragePath: path.resolve(__dirname, "../src/database/migrations"),
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    migrationStoragePath: path.resolve(__dirname, "../src/database/migrations"),
  },
};
