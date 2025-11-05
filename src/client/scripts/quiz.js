let type = "normal";
let questionIndex = 0;
let normalQuestions = [];
let horrorQuestions = [];

let normalBgmStarted = false;

async function showQuestion(){
    const q = (type === "normal") ? normalQuestions[questionIndex] : horrorQuestions[questionIndex];
    await setBackground(type);

    const questionDiv = document.getElementById("question");
    const choicesDiv = document.getElementById("choices");

    questionDiv.textContent = q.question;
    choicesDiv.innerHTML = "";

    // 일반 모드 첫 문제에서 브금 재생
    if (type === "normal" && questionIndex === 0) {
        // 혹시 남은 브금이 있으면 정지
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }

        const bgm = new Audio("./assets/audios/normal.mp3");
        bgm.loop = true;
        bgm.volume = 0.5;
        bgm.play().catch(()=>{});
        window.currentBgm = bgm;
    }

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
    const finalDeadly = deadly.filter(() => Math.random() <  1.0);
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

    // 일반 모드 첫 문제에서 normal.mp3 재생
    if (type === "normal" && questionIndex === 0) {
        const bgm = new Audio("./assets/audios/normal.mp3");
        bgm.loop = true;
        bgm.volume = 0.5;
        bgm.play().catch(()=>{});
        window.currentBgm = bgm; // 전역 저장
    }

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
    // 일반 → 공포 전환 감지
    if (type === "normal" && questionIndex >= normalQuestions.length) {
        console.log(">>> 공포 모드로 전환됨"); // 디버깅 확인용
        type = "horror";
        questionIndex = 0;

        // 기존 브금 정지
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }

        // 공포 브금 재생
        const horrorBgm = new Audio("./assets/audios/horror-audios.mp3");
        horrorBgm.loop = true;
        horrorBgm.volume = 0.5;
        horrorBgm.play().catch(err => console.error("공포 브금 재생 실패:", err));
        window.currentBgm = horrorBgm;
    }

    // 공포 모드 종료 → 엔딩
    else if (type === "horror" && questionIndex >= horrorQuestions.length) {
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }
        window.location.href = "ending.html";
        return;
    }

    showQuestion();
}





startGame();

function checkAnswer(choice, answer){
    // 클릭 사운드
    const clickSound = new Audio("./assets/audios/click.mp3");
    clickSound.volume = 0.7;
    clickSound.play().catch(()=>{});

    const isCorrect = (choice === answer);
    if (isCorrect && type === "horror") triggerJumpscare();
    questionIndex++;
    moveToNextQuestion();
}

let horrorBgm = null;
function moveToNextQuestion(){
    if (type === "normal" && questionIndex >= normalQuestions.length) {
        type = "horror";
        questionIndex = 0;

        // 기존 normal 브금 완전히 정지
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }

        // 공포 브금 재생
        const horrorBgm = new Audio("./assets/audios/horror-sound.mp3");
        horrorBgm.loop = true;
        horrorBgm.volume = 0.5;
        horrorBgm.play().catch(()=>{});
        window.currentBgm = horrorBgm;
    }
    else if (type === "horror" && questionIndex >= horrorQuestions.length) {
        // 엔딩 진입 전 브금 정지
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }
        window.location.href = "ending.html";
        return;
    }

    showQuestion();
}
