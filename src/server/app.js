const express = require("express");
const app = express();
const mysql = require('mysql');
const path = require("path");
// client 폴더 정적 파일 제공 폴더로 지정
app.use(express.static(path.join(__dirname, "../client")));
app.use("/assets", express.static(path.join(__dirname,"../client/assets")));
app.use(express.json()); 

// MySQL 연결
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fine_the_answer"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL 연결 성공!!!");
});

// assets 정적 파일
app.use("/assets", express.static(path.join(__dirname, "../client/assets")));

// 특정 정보 DB에서 조회
app.get("/assets/fileinfo/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const sql = "SELECT * FROM assets WHERE file_name = ?";
  db.query(sql, [fileName], (err, results) => {
    if (err) console.error("ERROR : ", err);
    const asset = results[0];
    asset.file_path = `/assets/images/${asset.file_name}`;
    res.json(asset);
  });
});

// 일반 배경 이미지 요청
app.get("/backgrounds/normal", (req, res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE file_name = 'quiz-background.png'";
  db.query(sql, (err, result) => {
    if (err) console.error("ERROR : ", err);
    res.json(result[0]);
  });
});

// 공포 배경 이미지 요청
app.get("/backgrounds/horror", (req, res) => {
  const sql = "SELECT file_path, file_name FROM assets WHERE category = 'image' AND file_name LIKE 'horror%'";
  db.query(sql, (err, results) => {
    if (err) console.error("ERROR : ", err);
    const randomIndex = Math.floor(Math.random() * results.length);
    res.json(results[randomIndex]);
  });
});

// 랜덤 점프스케어
app.get("/jumpscare/random", (req,res)=>{
  // DB에서 jump_scare 이미지와 scary-audio 오디오를 각각 랜덤 선택
  const sqlImages = "SELECT file_name FROM assets WHERE category = 'jump_scare'";
  const sqlAudios = "SELECT file_name FROM assets WHERE category = 'scary-audio'";

  db.query(sqlImages, (err, imageResults) => {
    if(err){
      console.error("이미지 DB 오류:", err);
      return res.status(500).json({ error: "이미지 DB 오류" });
    }
    if(imageResults.length === 0){
      return res.status(404).json({ error: "점프스케어 이미지 없음" });
    }

    db.query(sqlAudios, (err, audioResults) => {
      if(err){
        console.error("오디오 DB 오류:", err);
        return res.status(500).json({ error: "오디오 DB 오류" });
      }
      if(audioResults.length === 0){
        return res.status(404).json({ error: "점프스케어 오디오 없음" });
      }

      // 랜덤 선택
      const randomImage = imageResults[Math.floor(Math.random() * imageResults.length)].file_name;
      const randomAudio = audioResults[Math.floor(Math.random() * audioResults.length)].file_name;

      // 브라우저 기준 URL 반환
      res.json({
        image_path: `/assets/jump-scares/${randomImage}`,
        sound_path: `/assets/audios/${randomAudio}`
      });
    });
  });
});


// 일반 퀴즈
app.get("/quiz/normal", (req, res) => {
  // quiz_type = normal 문제 전체 JSON 반환
  const sql = "SELECT * FROM quiz WHERE quiz_type = 'normal'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("ERROR : ", err);
    }
    const formatted = results.map(q => ({
      id: q.id,
      question: q.problem,
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
    if (err) console.error("ERROR : ", err);
    const formatted = results.map(q => ({
      id: q.id,
      question: q.problem,
      answer: q.answer,
      choices: q.choices ? q.choices.split(",").map(c => c.trim()) : [],
      quiz_type: q.quiz_type
    }));

    res.json(formatted);
  });
});
app.get("/backgrounds/horrorEnding", (req, res) => {
    const sql = "SELECT file_path FROM assets WHERE file_name = ?";
    db.query(sql, ['main-page-weird.png'], (err, results) => {
      if (err) console.error("ERROR : ", err);
      res.json({ file_path: results[0].file_path });
    });
});

// 즉사 문제 이미지 불러오기
// 즉사 문제 이미지/사운드
app.get("/horror/:id", (req, res) => {
  const quizId = Number(req.params.id);

  let imageId, soundId;
  if (quizId === 9) {
    imageId = 8;
    soundId = 27;
  } else if (quizId === 10) {
    imageId = 7;
    soundId = 30;
  }

  if (!imageId || !soundId) {
    return res.status(400).json({ error: "invalid quizId" });
  }

  const sql = "SELECT id, file_name FROM assets WHERE id IN (?, ?)";
  db.query(sql, [soundId, imageId], (err, results) => {
    if (err) {
      console.error("ERROR:", err);
      return res.status(500).json({ error: "db_failed" });
    }

    const image = results.find(r => r.file_name.endsWith(".png"));
    const sound = results.find(r => r.file_name.endsWith(".mp3"));

    // ✅ imageId가 7이면 ringing.mp3로 고정
    const soundPath =
      imageId === 7
        ? "/assets/sounds/ringing.mp3"
        : `/assets/sounds/${sound.file_name}`;

    res.json({
      image_path: `/assets/images/${image.file_name}`,
      sound_path: soundPath
    });
  });
});


// users 추가 (중복 체크 포함)
app.post("/users", (req, res) => {
  const { name } = req.body;
  const sql = "SELECT * FROM users WHERE name = ?";

  db.query(sql, [name], (err) => {
    if (err) console.error("ERROR : ", err);
    const insert = "INSERT INTO users (name) VALUES (?)";
    db.query(insert, [name], (err, result) => {
      if (err) console.error("ERROR : ", err);
      res.status(200).json({ name });
    });
  });
});


// 서버 실행
app.listen(3000, () => {
  console.log("메인화면 : http://localhost:3000/main.html");
});