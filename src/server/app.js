// 환경 변수 설정, 모듈 불러오기
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mysql = require('mysql2');
const app = express();

// 서버 기본 설정
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));
app.use("/assets", express.static(path.join(__dirname, "../client/assets")));

// MySQL 연결
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL 연결 성공!!!");
});

////////// Asssets API ///////////

// 개별 파일 정보 조회
app.get("/assets/fileinfo/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const sql = "SELECT * FROM assets WHERE file_name = ?";
  db.query(sql, [fileName], (err, results) => {
    if (err) return res.status(500).json({ error: "서버 오류남" });
    if (results.length === 0) return res.status(404).json({ error: "파일을 못찾음" });

    const asset = results[0];
    asset.file_path = `/assets/images/${asset.file_name}`;
    res.json(asset);
  });
});

// 일반 배경 이미지
app.get("/backgrounds/normal", (req, res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE file_name = 'quiz-background.png'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "DB 오류남" });
    res.json(result[0]);
  });
});

// 공포 배경 이미지 
app.get("/backgrounds/horror", (req, res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE category = 'image' AND file_name LIKE 'horror%'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB 오류남" });
    const randomIndex = Math.floor(Math.random() * results.length);
    res.json(results[randomIndex]);
  });
});

// 공포 엔딩 배경
app.get("/backgrounds/horrorEnding", (req, res) => {
    const sql = "SELECT file_path FROM assets WHERE file_name = ?";
    db.query(sql, ['main-page-weird.png'], (err, results) => {
      if (err) console.error("ERROR : ", err);
      res.json({ file_path: results[0].file_path });
    });
});

// 랜덤 점프스케어 이미지 + 오디오
app.get("/jumpscare/random", (req,res)=>{
  const sqlImages = "SELECT file_name FROM assets WHERE category = 'jump_scare'";
  const sqlAudios = "SELECT file_name FROM assets WHERE category = 'scary-audio'";

   db.query(sqlImages, (err, imageResults) => {
    if (err) return res.status(500).json({ error: "이미지 DB 오류남" });
    if (imageResults.length === 0) return res.status(404).json({ error: "점프스케어 이미지 없음" });

    db.query(sqlAudios, (err, audioResults) => {
      if (err) return res.status(500).json({ error: "오디오 DB 오류" });
      if (audioResults.length === 0) return res.status(404).json({ error: "점프스케어 오디오 없음" });

      const randomImage = imageResults[Math.floor(Math.random() * imageResults.length)].file_name;
      const randomAudio = audioResults[Math.floor(Math.random() * audioResults.length)].file_name;

      res.json({
        image_path: `/assets/jump-scares/${randomImage}`,
        sound_path: `/assets/audios/${randomAudio}`
      });
    });
  });
});

////////// Quiz API ///////////

// 일반 퀴즈
app.get("/quiz/normal", (req, res) => {
  const sql = "SELECT * FROM quiz WHERE quiz_type = 'normal'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB 오류남" });

    const formatted = results.map(q => ({
      id: q.id,
      question: q.problem,
      answer: q.answer,
      choices: q.choices ? q.choices.split(",").map(a => a.trim()) : [],
      quiz_type: q.quiz_type,
    }));
    res.json(formatted);
  });
});

// 공포 퀴즈 (id 6~14)
app.get("/quiz/horror", (req, res) => {
  const sql = "SELECT * FROM quiz WHERE quiz_type = 'horror' AND id BETWEEN 6 AND 14";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB 오류" });

    const formatted = results.map(q => ({
      id: q.id,
      question: q.problem,
      answer: q.answer,
      choices: q.choices ? q.choices.split(",").map(c => c.trim()) : [],
      quiz_type: q.quiz_type,
    }));
    res.json(formatted);
  });
});

// 즉사 문제 이미지
app.get("/horror/:id", (req, res) => {
  const quizId = parseInt(req.params.id);
  let imageId, soundId;

  if (quizId === 9) {
    imageId = 8;
    soundId = 27;
  } else if (quizId === 10) {
    imageId = 7;
    soundId = 30;
  }

  const sql = "SELECT id, file_name FROM assets WHERE id IN (?, ?)";
  db.query(sql, [soundId, imageId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });

    const image = results.find(r => r.file_name.endsWith(".png"));
    const sound = results.find(r => r.file_name.endsWith(".mp3"));

    const soundPath =
      imageId === 7
        ? "/assets/audios/ringing.mp3"
        : sound
        ? `/assets/audios/${sound.file_name}`
        : "/assets/audios/telephone.mp3";

    res.json({
      image_path: `/assets/images/${image.file_name}`,
      sound_path: soundPath,
    });
  });
});

////////// Users API ///////////

// 유저 추가 (중복 확인 포함)
app.post("/users", (req, res) => {
  const { name, play_time } = req.body;

  // ✅ 닉네임만 있을 때도 허용
  if (!name) {
    return res.status(400).json({ error: "닉네임이 필요합니다." });
  }

  const time = isNaN(play_time) ? 0 : play_time; // play_time 없으면 0으로 기본 설정

  const checkSql = "SELECT * FROM users WHERE name = ?";

  db.query(checkSql, [name], (err, results) => {
    if (err) {
      console.error("DB 조회 실패:", err);
      return res.status(500).json({ error: "DB 조회 실패" });
    }if (results.length > 0) {
      return res.status(409).json({ error: "이미 존재하는 닉네임입니다." });
    }

    const insertSql = "INSERT INTO users (name, play_time) VALUES (?, ?)";
    db.query(insertSql, [name, time], (err, result) => {
      if (err) {
        console.error("DB 저장 실패:", err);
        return res.status(500).json({ error: "DB 저장 실패" });
      }
      return res.status(201).json({
        message: "신규 유저 저장 완료",
        id: result.insertId,
        name,
        play_time: time
      });
    });
  });
});


// 서버 실행
app.listen(3000, () => {
  console.log("메인화면 : http://localhost:3000/main.html");
});