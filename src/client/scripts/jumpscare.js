async function triggerJumpscare() {
  const res = await fetch("/jumpscare/random");
  const data = await res.json();

  if(!data.sound_path) return;
  console.log(data.sound_path);
  const audio = new Audio(data.sound_path);
  audio.play();

  const scareImg = document.createElement("img");
  scareImg.src = data.image_path;
  scareImg.style.position = "fixed";
  scareImg.style.top = "0";
  scareImg.style.left = "0";
  scareImg.style.width = "100vw";   // 뷰포트 가로 꽉 채우기
  scareImg.style.height = "100vh";  // 뷰포트 세로 꽉 채우기
  scareImg.style.zIndex = "9999";
  scareImg.style.objectFit = "cover"; // 화면 비율 꽉 채우기
  scareImg.style.pointerEvents = "none";
  document.body.appendChild(scareImg);

  audio.addEventListener("ended", () => {
    audio.pause();
    scareImg.remove();
  });
}