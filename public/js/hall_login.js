document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById('loginForm');
    const guestOrderButton = document.getElementById("guestOrderButton");
    const registerButton = document.getElementById("client_registration");
    const faceLoginButton = document.getElementById("faceLoginButton"); // 👤 얼굴 인식 로그인 버튼
    const messageBox = document.getElementById("message")



    
    //로그인 폼 제출 이벤트 리스너
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); //기본 폼 제출 방지

        const user_id = document.getElementById('userid').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            // 서버로 로그인 요청 보내기
            const response = await fetch('http://localhost:5002/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, password }),
            });
            //응답을 먼저 확인
            const responseText = await response.text();
            console.log('서버 응답:', responseText);

            try 
            {
                const parsedData = JSON.parse(responseText); // JSON으로 변환

                if (response.ok && parsedData.success) {
                    //로그인 성공시 sessionStorage에 사용자 정보 저장
                    sessionStorage.setItem("user_id", user_id);
                    sessionStorage.setItem("username", parsedData.username);
                    alert(`${parsedData.username}님, 환영합니다!`);  //회원 이름 알림창
                    window.location.href = "/member_hall_order.html"; // 매장회원주문 페이지 이동
                } else {
                    messageBox.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
                }
            } catch (error) {
                console.error('JSON 파싱 오류:', error, '응답 내용:', responseText);
                messageBox.textContent = '서버 응답이 올바르지 않습니다';
            }
        } catch (error) {
            console.error('로그인 요청 실패:', error);
            messageBox.textContent = '서버에 연결할 수 없습니다.';
        }

    });
}
// 👤 얼굴 인식 로그인 처리
if (faceLoginButton) {
    faceLoginButton.addEventListener("click", async () => {
        messageBox.textContent = "얼굴 인식을 시작합니다. 잠시만 기다려 주세요...";

        try {
            const response = await fetch("http://localhost:5000/face-login");
            
            // 응답이 JSON인지 확인 후 처리
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                throw new Error("얼굴 인식 요청 실패: 서버 응답 오류");
            }

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                
                if (data.success) {
                    sessionStorage.setItem("user_id", data.username); // 🔹 얼굴 인식 로그인 성공 시 user_id 저장
                    sessionStorage.setItem("username", data.username);
                    alert(`✅ 얼굴 인식 로그인 성공! ${data.username}님`);
                    window.location.href = "/member_hall_order.html"; // 🔹 로그인 성공 시 이동
                } else {
                    messageBox.textContent = "얼굴 인식 실패. 다시 시도하세요.";
                }
            } else {
                throw new Error("서버가 올바른 JSON을 반환하지 않음");
            }
        } catch (error) {
            console.error("얼굴 인식 요청 오류:", error);
            messageBox.textContent = "서버 오류가 발생했습니다. 다시 시도하세요.";
        }
    });
}




// 비회원 주문 버튼 클릭 시 비회원 매장 주문 페이지로 이동
if (guestOrderButton) {
    guestOrderButton.addEventListener("click", (event) => {
        event.preventDefault(); // 기본 폼 제출 방지
        console.log("비회원 주문 페이지로 이동");
        window.location.href = "/hall_order.html";
    });
}
    
// 회원가입 버튼 클릭 시 client_registration.html로 이동
        if (registerButton) {
            registerButton.addEventListener("click", (event) => {
                event.preventDefault();
                console.log("회원가입 페이지로 이동");
                window.location.href = "/client_registration.html?from=hall_login.html";  // 회원가입 페이지로 이동
            });
        }
    });
////////////////////////배경화면///////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("backgroundCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const waves = [];
    const numWaves = 5; 

    for (let i = 0; i < numWaves; i++) {
        waves.push({
            y: Math.random() * canvas.height,
            amplitude: Math.random() * 40 + 20, 
            wavelength: Math.random() * 80 + 40, 
            speed: Math.random() * 2 + 1 
        });
    }

    function drawWaves() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        
        for (let i = 0; i < numWaves; i++) {
            const wave = waves[i];
            ctx.moveTo(0, wave.y);

            for (let x = 0; x < canvas.width; x++) {
                const y = wave.y + Math.sin((x + wave.speed * Date.now() * 0.002) / wave.wavelength) * wave.amplitude;
                ctx.lineTo(x, y);
            }
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();

        requestAnimationFrame(drawWaves);
    }

    drawWaves();
});
////////////////////////////////////////////////////////////////////////////




    
    
        