window.addEventListener("DOMContentLoaded", () => {
  // 플레이어 정보
  const playerName = localStorage.getItem("playerName");
  const sec = parseInt(localStorage.getItem("totalPlayTime"), 10);
  const nameSpan = document.getElementById("name");
  const timeSpan = document.getElementById("playtime");

  let minutes = 0;
  let seconds = 0;

  if (playerName && !isNaN(sec)) {
    // 서버로 유저 정보 전송
    fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: playerName,
        play_time: sec
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("유저 등록 실패");
        return res.json();
      })
      .then(data => console.log("유저 저장 완료:", data))
      .catch(err => console.error("유저 저장 실패:", err));

    // 화면 표시용
    minutes = Math.floor(sec / 60);
    seconds = sec % 60;
    nameSpan.innerText = ` ${playerName}`;
    timeSpan.innerText = ` ${minutes} : ${seconds}`;
  }

  // 기존 브금 정지
  document.querySelectorAll("audio").forEach(a => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  });

  if (window.currentBgm) {
    try {
      window.currentBgm.pause();
      window.currentBgm.currentTime = 0;
      window.currentBgm = null;
    } catch {}
  }

  // 엔딩 브금 재생
  const endingBgm = new Audio("./assets/audios/ending.mp3");
  endingBgm.loop = true;
  endingBgm.volume = 0.6;
  endingBgm.play().catch(() => {});

  // 맞춘 문제 불러오기
  const correctAnswers = JSON.parse(localStorage.getItem("correctAnswers")) || [];
  const solvedContainer = document.getElementById("solved-container");
  const solvedCountSpan = document.getElementById("solved_problems");

  solvedCountSpan.innerText = ` ${correctAnswers.length}`;

  if (correctAnswers.length === 0) {
    solvedContainer.innerHTML = "<p>맞춘 문제가 없습니다....</p>";
  } else {
    solvedContainer.innerHTML = `
      ${correctAnswers
        .map(
          (q, i) => `
        <li>
          <strong>${i + 1}. 문제:</strong> ${q.question}<br>
          <strong>정답:</strong> ${q.answer}<br>
        </li>
      `
        )
        .join("")}
    `;
  }

  // 다음 게임을 위해 정리
  localStorage.removeItem("correctAnswers");
  localStorage.removeItem("playerName");
  localStorage.removeItem("totalPlayTime");
});