document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const user_id = document.getElementById("user_id").value;
        const password = document.getElementById("password").value;
        const confirm_password = document.getElementById("confirm_password").value;

        // 데이터 검증
        if (!username || !user_id || !password || !confirm_password) {
            alert("모든 필드를 입력해주세요.");
            return;
        }


        const userData = { username, user_id, password, confirm_password };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = "✅ 회원가입 성공! 로그인 페이지로 이동하세요.";
                registerMessage.style.color = "green";
                
            } else {
                registerMessage.textContent = "❌ " + data.error;
                registerMessage.style.color = "red";
            }
        } catch (error) {
            console.error("회원가입 오류:", error);
            registerMessage.textContent = "❌ 서버 오류가 발생했습니다.";
            registerMessage.style.color = "red";
        }
    });
});

document.getElementById("goToLoginButton").addEventListener("click", function () {
    window.location.href = "/login";  // ✅ login.html이 아니라 /login으로 요청
});

