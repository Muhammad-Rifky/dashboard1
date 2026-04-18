import mysql from "mysql2/promise";

const config = {
  host: "76.13.192.195",
  user: "iot_user",
  password: "123456",
  database: "iot_system",
};

const db = mysql.createPool(config);

// debug aman
console.log("🔥 DB CONNECTED:", {
  host: config.host,
  database: config.database,
});

export default db;
