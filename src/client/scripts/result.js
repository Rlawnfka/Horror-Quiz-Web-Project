const playerName = localStorage.getItem('playerName');
const sec = localStorage.getItem("totalPlayTime");
let minutes = 0;
let seconds = 0;
// 플레이 타임
if(playerName && sec){
    minutes = Math.floor(sec / 60);
    seconds = sec % 60;
}

document.getElementById("name").innerText = `  ${playerName}`;
document.getElementById("playtime").innerText = `  ${minutes} : ${seconds}`;