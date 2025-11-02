const playerName = localStorage.getItem('playerName');
let type = "normal";
let questionIndex = 0;
let normalQuestions = [];
let horrorQuestions = [];

// 문제 불러오기
async function loadQuestions(quiz_type) {
    const res = await fetch(`/quiz/${quiz_type}`);
    return await res.json();
}

// 배열 섞기
function shuffle(array){
    for (let i = array.length-1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 게임 시작
async function startGame(){
    normalQuestions = shuffle((await loadQuestions("normal"))).slice(0,5);

    const allHorror = await loadQuestions("horror");
    const deadly = allHorror.filter(q => [9,10].includes(q.id));
    const normalHorror = allHorror.filter(q => q.id >=6 && q.id<=14 && ![9,10].includes(q.id));
    const finalDeadly = deadly.filter(() => Math.random() < 0.3);
    horrorQuestions = shuffle([...normalHorror, ...finalDeadly]);

    showQuestion();
}

// 배경 설정
async function setBackground(type) {
    const res = await fetch(`/backgrounds/${type}`);
    const data = await res.json();
    const bgDiv = document.getElementById("background");
    bgDiv.style.backgroundImage = `url(${data.file_path})`;
}

// 즉사 문제 처리
async function showDeadlyQuestion(q) {
    const deadlyRes = await fetch(`/horror/${q.id}`);
    const deadlyData = await deadlyRes.json();

    const img = document.createElement("img");
    img.src = deadlyData.image_path;
    img.style.width = "300px";
    img.style.cursor = "pointer";

    const audio = new Audio(deadlyData.sound_path);
    img.addEventListener("click", () => audio.play());
    audio.addEventListener("ended", () => {
        triggerJumpscare();
        setTimeout(() => window.location.href = "main.html", 900);
    });
    
    // 즉사 이미지 띄우기
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    choicesDiv.appendChild(img);
}

async function showQuestion(){
    const q = (type === "normal") ? normalQuestions[questionIndex] : horrorQuestions[questionIndex];
    await setBackground(type);

    const questionDiv = document.getElementById("question");
    const choicesDiv = document.getElementById("choices");

    questionDiv.textContent = q.question;
    choicesDiv.innerHTML = "";

    if (!q.choices || q.choices.length === 0) {
        await showDeadlyQuestion(q);
        return;
    }

    q.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice;
        btn.onclick = () => checkAnswer(choice, q.answer);
        choicesDiv.appendChild(btn);
    });
}

function checkAnswer(choice, answer){
    const isCorrect = (choice === answer);
    if (isCorrect && type === "horror") triggerJumpscare();
    questionIndex++;
    moveToNextQuestion();
}

function moveToNextQuestion(){
    if (type === "normal" && questionIndex >= normalQuestions.length) {
        type = "horror";
        questionIndex = 0;
    } else if (type === "horror" && questionIndex >= horrorQuestions.length) {
        window.location.href = "ending.html";
        return;
    }
    showQuestion();
}

startGame();
