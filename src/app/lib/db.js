import mysql from "mysql2/promise";

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "iot_system",
};

const db = mysql.createPool(config);

// debug aman
console.log("🔥 DB CONNECTED:", {
  host: config.host,
  database: config.database,
});

export default db;