const express = require("express");
const app = express();
const mysql = require('mysql');
const path = require("path");

app.use(express.static(path.join(__dirname, "../client")));
app.use(express.json()); 

// MySQL 연결 설정
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0812",
  database: "find_the_answer"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL 연결 성공!!!");
});

// assets 정적 폴더
app.use("/assets", express.static(path.join(__dirname, "../client/assets")));

// 특정 파일 정보 조회
app.get("/assets/fileinfo/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const sql = "SELECT * FROM assets WHERE file_name = ?";
  
  db.query(sql, [fileName], (err, results) => {
    if (err) return res.status(500).send("DB ERROR!!");
    if (results.length === 0) return res.status(404).send("IMAGE NOT FOUND!!");

    const asset = results[0];
    asset.file_path = `/assets/images/${asset.file_name}`;
    res.json(asset);
  });
});


// 일반 배경
app.get("/backgrounds/normal", (req, res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE file_name = 'quiz-background.png'";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("배경 DB 오류!!!!", err);
      return res.status(500).json({ error: "DB 오류" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "배경 이미지 없음!!!!!" });
    }
    res.json(result[0]);
  });
});


// 공포 배경
app.get("/backgrounds/horror", (req, res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE category = 'image' AND file_name LIKE 'horror%'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("공포 배경 DB 오류!!", err);
      return res.status(500).json({ error: "DB 오류" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "공포 배경 이미지 없음!" });
    }

    const randomIndex = Math.floor(Math.random() * results.length);
    const selected = results[randomIndex];
    res.json(selected);
  });
});


// 일반 퀴즈
app.get("/quiz/normal", (req, res) => {
  const sql = "SELECT * FROM quiz WHERE quiz_type = 'normal'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("일반 퀴즈 DB 오류!!", err);
      return res.status(500).json({ error: "DB 오류!" });
    }

    const formatted = results.map(q => ({
      id: q.id,
      question: q.problem || q.question,
      answer: q.answer,
      choices: q.choices ? q.choices.split(",").map(a => a.trim()) : [],
      quiz_type: q.quiz_type
    }));

    res.json(formatted);
  });
});


// 공포 퀴즈 (id 6~14만)
app.get("/quiz/horror", (req, res) => {
  const sql = "SELECT * FROM quiz WHERE quiz_type = 'horror' AND id BETWEEN 6 AND 14";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("공포 퀴즈 DB 오류!!", err);
      return res.status(500).json({ error: "DB 오류 발생!" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "호러 문제 없음!" });
    }

    const formatted = results.map(q => ({
      id: q.id,
      question: q.problem || q.question,
      answer: q.answer,
      choices: q.choices ? q.choices.split(",").map(c => c.trim()) : [],
      quiz_type: q.quiz_type
    }));

    res.json(formatted);
  });
});
app.get("/quiz/horror/ending",(req,res)=>{
  const sql = "SELECT * FROM quiz WHERE quiz_type = 'horror' AND id = 15";
  db.query(sql, (err, result)=>{
    if(err){
      console.error("공포 퀴즈 DB 오류!!", err);
      return res.status(500).json({ error: "DB 오류 발생!" });
    }
    
  })
})


// users 조회
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// users 추가 (중복 체크 포함)
app.post("/users", (req, res) => {
  const { name } = req.body;
  const checkQuery = "SELECT * FROM users WHERE name = ?";

  db.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error("DB 조회 에러:", err);
      return res.status(500).json({ error: "DB 조회 오류" });
    }

    if (results.length > 0) {
      return res.status(409).json({ duplicate: true });
    }

    const insertQuery = "INSERT INTO users (name) VALUES (?)";
    db.query(insertQuery, [name], (err, result) => {
      if (err) {
        console.error("DB 저장 에러:", err);
        return res.status(500).json({ error: "DB 저장 실패" });
      }
      res.status(200).json({ name });
    });
  });
});


// 서버 실행
app.listen(3000, () => {
  console.log("🚀 서버 실행 중! http://localhost:3000/main.html");
});