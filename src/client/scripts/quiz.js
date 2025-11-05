let type = "normal";
let questionIndex = 0;
let normalQuestions = [];
let horrorQuestions = [];
let correctAnswers = [];

// 문제 보여주기
async function showQuestion() {
    const q = (type === "normal") ? normalQuestions[questionIndex] : horrorQuestions[questionIndex];
    await setBackground(type);

    const questionDiv = document.getElementById("question");
    const choicesDiv = document.getElementById("choices");

    questionDiv.textContent = q.question;
    choicesDiv.innerHTML = "";

    if (type === "normal" && questionIndex === 0) {
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }

        const bgm = new Audio("./assets/audios/normal.mp3");
        bgm.loop = true;
        bgm.volume = 0.5;
        bgm.play().catch(() => {});
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
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 게임 시작
async function startGame() {
    localStorage.removeItem("correctAnswers"); // 시작 시 기록 초기화
    correctAnswers = [];

    normalQuestions = shuffle((await loadQuestions("normal"))).slice(0, 5);

    const allHorror = await loadQuestions("horror");
    const deadly = allHorror.filter(q => [9, 10].includes(q.id));
    const normalHorror = allHorror.filter(q => q.id >= 6 && q.id <= 14 && ![9, 10].includes(q.id));
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

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    choicesDiv.appendChild(img);
}

// 정답 체크
function checkAnswer(choice, answer) {
    const clickSound = new Audio("./assets/audios/click.mp3");
    clickSound.volume = 0.7;
    clickSound.play().catch(() => {});

    const isCorrect = (choice === answer);
    if (isCorrect) {
        const currentQuestion = (type === "normal")
            ? normalQuestions[questionIndex]
            : horrorQuestions[questionIndex];

        correctAnswers.push({
            question: currentQuestion.question,
            answer: currentQuestion.answer
        });

        if (type === "horror") {
            triggerJumpscare();
        }
    }

    questionIndex++;
    moveToNextQuestion();
}

// 다음 문제로 이동
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
        const horrorBgm = new Audio("./assets/audios/horror-sound.mp3");
        horrorBgm.loop = true;
        horrorBgm.volume = 0.5;
        horrorBgm.play().catch(err => console.error("공포 브금 재생 실패:", err));
        window.currentBgm = horrorBgm;
    }
    else if (type === "horror" && questionIndex >= horrorQuestions.length) {
        if (window.currentBgm) {
            window.currentBgm.pause();
            window.currentBgm.currentTime = 0;
            window.currentBgm = null;
        }

        localStorage.setItem("correctAnswers", JSON.stringify(correctAnswers));
        window.location.href = "ending.html";
        return;
    }

    showQuestion();
}
startGame();