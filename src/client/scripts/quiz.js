const playerName = localStorage.getItem('playerName');
// TODO : 만약 공포 모드에서 특정한 선택지를 고르면 갑툭튀가 튀어나옴
let type = "normal";
let questionIndex = 0;
let normalQuestions = [];
let horrorQuestions = [];

async function loadQuestions(quiz_type) {
    const res = await fetch(`/quiz/${quiz_type}`);
    return await res.json();
}

function shuffle(array){
    for (let i = array.length-1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function startGame(){
    // 일반 퀴즈 불러오기
    normalQuestions = await loadQuestions("normal");
    normalQuestions = shuffle(normalQuestions).slice(0,5);

    // 호러 퀴즈 불러오기
    const allHorror = await loadQuestions("horror");
    horrorQuestions = allHorror.filter(q => q.id >= 6 && q.id <= 14);
    horrorQuestions = shuffle(horrorQuestions);

    const normalHorror = allHorror.filter(q=>q.id >=6 && q.id<=14 && q.id !=9 && q.id!==10);
    // 즉사 문제
    const deadly = allHorror.filter(q => q.id === 9 || q.id === 10);
    // 30% 확률
    const finalDeadly = deadly.filter(()=>Math.random() < 0);

    horrorQuestions = shuffle([...normalHorror, ...finalDeadly]);
    
    showQuestion();
}
async function showQuestion(){
    let q;
    if(type === "normal") {
        q = normalQuestions[questionIndex];

        // 일반 배경 불러오기
        fetch(`/backgrounds/normal`)
        .then(res => res.json())
        .then(asset => {
            const bgDiv = document.getElementById("background");
            bgDiv.style.backgroundImage = `url(${asset.file_path})`;
        })
        .catch(err => {
            console.error("배경 이미지 불러오기 실패!!!",err);
        });
    }else if(type === "horror"){
        q = horrorQuestions[questionIndex];
        if(!q){
            console.log("공포 문제 모두 완료!!!");
            return;
        }

        const horrorBg = await getRandomHorrorBackground();
        const bgDiv = document.getElementById("background");
        ////// 랜덤 공포 배경 넣어야함 //////
        bgDiv.style.backgroundImage = `url(${horrorBg})`; 
    }
    // 문제 표시
    const questionDiv = document.getElementById("question");
    const choicesDiv = document.getElementById("choices");

    questionDiv.textContent = q.question;
    choicesDiv.innerHTML = "";
    document.getElementById("question").textContent = q.question;

    // 문항 버튼 그리기
     if(!q.choices || q.choices.length === 0){
        console.error("choices 배열이 비어 있음!");
        return;
    }
    // 문항 버튼 그리기
    q.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice;
        btn.onclick = () => checkAnswer(choice, q.answer);
        choicesDiv.appendChild(btn);
    });
}

function getRandomHorrorQuestion() {
    // 모든 문제를 다 풀었을 때
    if(horrorQuestions.length === 0) return null;
    const index = Math.floor(Math.random() * horrorQuestions.length);
    const q = horrorQuestions[index];
    horrorQuestions.splice(index, 1);
    return q;
}

// 랜덤 공포 배경 이미지 DB에서 불러오기
async function getRandomHorrorBackground() {
    const res = await fetch(`/backgrounds/horror`);
    const data = await res.json();
    return data.file_path;
}

function checkAnswer(choice, answer){
    const isCorrect = (choice === answer);
    if(isCorrect) {
        if(type === "horror"){
            triggerJumpscare();
        }
    }else{
        alert("오답!");
    }
    questionIndex++
    moveToNextQuestion();
}
function moveToNextQuestion(){
    if(type === "normal"){
        if(questionIndex >= normalQuestions.length){
            type = "horror";
            questionIndex = 0;
        }
    }else if(type === "horror"){
        if(questionIndex >= horrorQuestions.length){
            window.location.href = "ending.html";
            return;
        }
    }
    showQuestion();
}

startGame();