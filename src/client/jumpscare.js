function triggerJumpscare() {
  // 사운드 랜덤 선택
  const sounds = [
    "./assets/audios/Sound1.mp3",
    "./assets/audios/Sound2.mp3",
    "./assets/audios/Sound3.mp3",
    "./assets/audios/Sound4.mp3"
  ];
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  const audio = new Audio(randomSound);
  audio.play();

  // 이미지 랜덤 선택
  const images = [];
  for (let i = 1; i <= 9; i++) {
    images.push(`./assets/jump-scares/jump-scare-${i}.png`);
  }
  const randomImg = images[Math.floor(Math.random() * images.length)];

  // 이미지 DOM 추가
  const scareImg = document.createElement("img");
  scareImg.src = randomImg;
  scareImg.style.position = "fixed";
  scareImg.style.top = "0";
  scareImg.style.left = "0";
  scareImg.style.width = "100vw";   // 뷰포트 가로 꽉 채우기
  scareImg.style.height = "100vh";  // 뷰포트 세로 꽉 채우기
  scareImg.style.zIndex = "9999";
  scareImg.style.objectFit = "cover"; // 화면 비율 꽉 채우기
  scareImg.style.pointerEvents = "none";
  document.body.appendChild(scareImg);

  setTimeout(() => {
    scareImg.remove();
  }, 1000);
}
