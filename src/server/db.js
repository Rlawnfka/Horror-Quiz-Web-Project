const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",    // DB 주소
  user: "root",         // 사용자
  password: "비밀번호", // 사용자 비밀번호
  database: "horror_quiz", // DB 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();
module.exports = promisePool;