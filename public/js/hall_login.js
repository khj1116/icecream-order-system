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
                window.location.href = "/client_registration.html";  // 회원가입 페이지로 이동
            });
        }
    });

    
    
        