const express = require("express");
const app = express();

const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    database : "quizdb"
});

db.connect(err => {
    if(err) throw err;
    console.log("MySQL 연결 성공!");
});