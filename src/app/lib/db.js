import mysql from "mysql2/promise";

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: "+07:00",
  dateStrings: true,
};

const db = mysql.createPool(config);

console.log("DB CONNECTED:", {
  host: config.host,
  port: config.port,
  database: config.database,
});

export default db;
