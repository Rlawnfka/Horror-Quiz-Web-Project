const express = require("express"); //express 연결
const app = express();
const mysql = require('mysql');


const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password:"0812",
    database : "find_the_answer"
});

db.connect(err => {
    if(err) throw err;
    console.log("MySQL 연결 성공");
});

app.get("/answers", (req, res) => { // 문제 답들 가져오기
    const sql = "SELECT * FROM quiz_answers";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get("/answers/:quizId", (req, res) => { // 퀴즈 ID 가져오기
    const quizId = req.params.quizId;
    const sql = "SELECT * FROM quiz_answers WHERE quiz_id = ?";
    db.query(sql, [quizId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log("서버 실행 중, http://localhost:3000/answers")
})

// users 전체 조회
app.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// user 추가 
app.use(express.json()); // JSON 파싱 미들웨어 추가

app.post("/users", (req, res) => {
    const { name } = req.body;
    const sql = "INSERT INTO users (name) VALUES (?)";
    db.query(sql, [name], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, name });
    });
});

const path = require("path");
app.use(express.static(path.join(__dirname, "../client")));
app.use("/assets", express.static(path.join(__dirname, "../client/assets")));