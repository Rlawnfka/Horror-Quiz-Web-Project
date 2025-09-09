// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true })); // form 데이터 처리
app.use(express.json()); // JSON 처리

// MySQL 연결
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // 본인 MySQL 아이디
  password: "비밀번호", // 본인 MySQL 비밀번호
  database: "testdb" // 본인 DB 이름
});

// HTML 정적 파일 제공 (public 폴더 안에 넣는 경우)
app.use(express.static(path.join(__dirname, "public")));

// 닉네임 저장 라우터
app.post("/submit", (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).send("닉네임이 필요합니다.");
  }

  const sql = "INSERT INTO nicknames (nickname) VALUES (?)";
  db.query(sql, [nickname], (err, result) => {
    if (err) {
      console.error("DB 오류:", err);
      return res.status(500).send("DB 저장 실패");
    }
    res.send(`<h1>${nickname}님 환영합니다!</h1>`);
  });
});

// 서버 실행
app.listen(3000, () => console.log("http://localhost:3000 에서 실행 중"));