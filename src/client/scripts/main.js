const form = document.querySelector(".form-container");
const input = document.querySelector(".nickname-input");

// 사용자 닉네임 입력받기
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nickname = input.value.trim();

  // 입력 검증
  if (!nickname) {
    alert("닉네임을 입력해주세요!");
    return;
  }
  if (nickname.length > 10) {
    alert("닉네임은 10글자를 넘을 수 없습니다!");
    return;
  }

  try {
    // 서버에 유저 등록 요청
    const res = await fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nickname }),
    });

    // 응답 상태별 처리
    if (res.status === 409) {
      alert("중복된 닉네임입니다!");
      return;
    }
    if (!res.ok) {
      throw new Error("유저 등록 실패");
    }

    // 성공 처리
    const data = await res.json();
    console.log("새 유저 저장 완료:", data);

    alert(`환영합니다, ${data.name}님!`);
    localStorage.setItem("playerName", data.name);
    window.location.href = "quiz.html";
    
  } catch (err) {
    console.error("저장 에러:", err);
    alert("서버와의 연결 중 문제가 발생했습니다.");
  }
});
