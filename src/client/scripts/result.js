const userName = localStorage.getItem("userName");
const sec = localStorage.getItem("totalPlayTime");

// 플레이 타임
if(userName && sec){
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
}