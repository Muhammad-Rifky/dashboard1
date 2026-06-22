import mysql from "mysql2/promise";

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "+07:00",
  dateStrings: true,
};

const db = mysql.createPool(config);

// debug aman
console.log("DB CONNECTED:", {
  host: config.host,
  database: config.database,
});

export default db;
