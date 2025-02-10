document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById('loginForm');
    const guestOrderButton = document.getElementById("guestOrderButton");
    const registerButton = document.getElementById("client_registration");
    
    //로그인 폼 제출 이벤트 리스너
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); //기본 폼 제출 방지

        const user_id = document.getElementById('userid').value.trim();
        const password = document.getElementById('password').value.trim();
        const messageBox = document.getElementById('message');

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
                    window.location.href = "/member_order.html"; // 회원주문 페이지 이동
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

// 비회원 주문 버튼 클릭 시 비회원 포장 주문 페이지로 이동
if (guestOrderButton) {
    guestOrderButton.addEventListener("click", (event) => {
        event.preventDefault(); // 기본 폼 제출 방지
        console.log("비회원 주문 페이지로 이동");
        window.location.href = "/guest_pack_order.html";
    });
}
    
// 회원가입 버튼 클릭 시 client_registration.html로 이동
        if (registerButton) {
            registerButton.addEventListener("click", (event) => {
                event.preventDefault();
                window.location.href = "/client_registration.html?from=/takeout_order.html";  // 회원가입 페이지로 이동
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

/////////////////페이지 편의 기능////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const languageButton = document.getElementById("toggle-language");

    // 언어 변환을 위한 텍스트 매핑
    const translations = {
        ko: {
            title: "🍦 포장 로그인 🤖",
            subtitle: "맛있는 소프트 아이스크림을 즐기세요!",
            "login-heading": "로그인",
            "box_login": "로그인",
            "username-label": "아이디:",
            "password-label": "비밀번호:",
            "login-button": "로그인",
            "client_registration": "회원가입",
            "guestOrderButton": "비회원 주문",
            "toggle-language": "English",
            "userid-placeholder": "아이디를 입력하세요",
            "password-placeholder": "비밀번호를 입력하세요"

        },
        en: {
            title: "🍦 pick-up Login 🤖",
            subtitle: "Enjoy delicious soft ice cream flavors!",
            "login-heading": "Login",
            "box_login": "LOGIN",
            "username-label": "UserID:",
            "password-label": "Password:",
            "login-button": "Login",
            "client_registration": "Sign Up",
            "guestOrderButton": "Guest Order",
            "toggle-language": "한국어",
            "userid-placeholder": "Enter your ID",
            "password-placeholder": "Enter your password"
        }
    };

    let currentLanguage = "ko"; // 기본 한국어 모드
    let largeFontMode = false;  // 큰 글씨 모드 꺼짐

    // 언어 변경 함수
    const updateLanguage = () => {
        const texts = translations[currentLanguage];
        //일반 텍스트 변경(h1, label...)
        for (const id in texts) {
            const element = document.getElementById(id);
            if (element) element.textContent = texts[id];
        }
        //input field의 placeholder 변경
        document.getElementById("userid").setAttribute("placeholder", texts["userid-placeholder"]);
        document.getElementById("password").setAttribute("placeholder", texts["password-placeholder"]);

    };

    // 언어 변경 버튼 클릭 이벤트
    if (languageButton) {
        languageButton.addEventListener("click", () => {
            currentLanguage = currentLanguage === "ko" ? "en" : "ko";
            updateLanguage();
        });
    }
    updateLanguage(); // 초기 언어 설정 적용
});
    
        