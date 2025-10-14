const form = document.querySelector(".form-container");
const input = document.querySelector(".nickname-input");
//// 사용자 닉네임 입력받기 ////
form.addEventListener("submit", function(event) {
  event.preventDefault(); // 기본 제출 막기
  const value = input.value.trim();
  if (value === "") {
    alert("닉네임을 입력해주세요!");
    return;
  } else if (value.length > 10) {
    alert("닉네임은 10글자를 넘을 수 없습니다!");
    return;
  }
  fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: value })
  })
    .then(res => {
      if (res.status === 409){
        alert("중복된 아이디입니다!");
        throw new Error("Duplicate nickname");
      }
      return res.json();
    })
    .then(data => {
    console.log("새 유저 저장 완료:", data);
    alert(`환영합니다, ${data.name}님!`);
    localStorage.setItem('playerName', data.name);
    window.location.href = 'quiz.html'; // 저장 후 quiz.html로 이동
  })
  .catch(err => {
    if(err.message !== "Duplicate nickname"){
      console.error("저장 에러:", err);
      alert("유저 저장 실패");
    }
  });
});