const express = require("express"); //express 연결
const app = express();
const mysql = require('mysql');
app.use(express.static(path.join(__dirname, "../client")));

const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password:"",
    database : "find_the_answer"
});

db.connect(err => {
    if(err) throw err;
    console.log("MySQL 연결 성공!!!!!");
});

app.use("/assets", express.static(path.join(__dirname, "../client/assets")));

app.get("/assets/fileinfo/:fileName", (req,res) => {
  const fileName = req.params.fileName;
  const sql = "SELECT * FROM assets WHERE file_name = ?";
  
  db.query(sql, [fileName], (err,results) => {
    if (err) return res.status(500).send("DB ERROR!!");
    if (results.length === 0) return res.status(404).send("IMAGE NOT FOUND!!");

    const asset = results[0];

    asset.file_path = `/assets/images/${asset.file_name}`;
    res.json(asset);
  });
});

app.get('/backgrounds/normal', (req,res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE file_name = 'quiz-background.png'";
  db.query(sql, (err,result) => {
    if(err){
      console.error("배경 DB 오류!!!!",err);
      return res.status(500).json({error : "DB 오류"});
    }
    if(result.length === 0) {
      return res.status(404).json({error : "배경 이미지 없음!!!!!"});
    }
    res.json(result[0]);
  });
});

app.get("/quiz/:type", (req, res) => {
  const type = req.params.type;
  const sql = "SELECT * FROM quiz WHERE quiz_type = ?";

  db.query(sql,[type],(err,results)=> {
    if(err){
      return res.status(500).json({error : "DB오류!!!!!"});
    }
    const formatted = results.map(q => {
      let choicesArray = [];
      if(typeof q.choices === "string" && q.choices.length > 0){
        choicesArray = q.choices.split(",").map(a => a.trim());
      }

      return {
        id : q.id,
        question : q.problem || q.question,
        answer : q.answer,
        choices : choicesArray,
        quiz_type : q.quiz_type
      };
    });
    res.json(formatted);
  })
});

// 문제 답들 가져오기
app.get("/quiz_answers", (req, res) => {
    const sql = "SELECT * FROM quiz_answers";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 퀴즈 ID 가져오기
app.get("/quiz_answers/:quizId", (req, res) => { 
    const quizId = req.params.quizId;
    const sql = "SELECT * FROM quiz_answers WHERE quiz_id = ?";
    db.query(sql, [quizId], (err, results) => {
        if (err) throw err;    
        res.json(results);
    });
});

// users 전체 조회
app.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// user 추가
app.use(express.json()); // ✅ JSON 파싱은 라우트보다 위에 와야 함

// users 전체 조회
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// user 추가 (닉네임 중복 체크 포함)
app.post("/users", (req, res) => {
  const { name } = req.body;
  const checkQuery = "SELECT * FROM users WHERE name = ?";

  db.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error("DB 조회 에러:", err);
      return res.status(500).json({ error: "DB 조회 오류" });
    }

    if (results.length > 0) {
      // 이미 존재하는 닉네임
      return res.status(409).json({ duplicate: true });
    }

    // 중복 아니면 새로 추가
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

app.listen(3000, () => {
    console.log("서버 실행 중, http://localhost:3000/main.html")
});