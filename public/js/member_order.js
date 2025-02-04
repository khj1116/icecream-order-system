document.addEventListener("DOMContentLoaded", () => {
    //회원 이름 가져오기
    const username = sessionStorage.getItem("username");  
    const welcomeText = document.getElementById("welcome-text");  //HTML 요소 가져오기

    if (welcomeText) {  // 요소가 존재하는 경우에만 실행
        if (username && username !== "undefined" && username !== "null") {
            welcomeText.textContent = `${username} 회원님! 안녕하세요.`;  // 템플릿 리터럴 사용
            console.log("회원 이름 표시:", username); // 디버깅 로그
        } else {
            welcomeText.textContent = "환영합니다! 회원 전용 주문 페이지입니다.";
            console.error("SessionStorage에 저장된 username이 없습니다.");
        }
    } else {
        console.error("❌ 'welcome-text' 요소를 찾을 수 없습니다. HTML을 확인하세요.");
    }

    const orderForm = document.getElementById("orderForm");
    const message = document.getElementById("message");

    if (orderForm) {
        orderForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const user_id = sessionStorage.getItem("user_id");
            const username = sessionStorage.getItem("username");

            const order = {
                flavor: document.getElementById("flavor").value,
                perform: document.getElementById("perform").value,
                topping: document.getElementById("topping").value,
                orderType: "packed",
                username: username,
                user_id: user_id
            };

            try {
                const response = await fetch("http://localhost:5000/order", {  //서버 주소 수정
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(order)
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    message.textContent = "주문이 성공적으로 접수되었습니다!";
                    orderForm.reset();
                } else {
                    message.textContent = "주문 접수에 실패했습니다.";
                }
            } catch (error) {
                message.textContent = "서버와 연결할 수 없습니다.";
            }
        });
    } else {
        console.error("'orderForm' 요소를 찾을 수 없습니다.");
    }
});







        

//로그인 유지 기능을 프론트 엔드에 추가
    document.addEventListener("DOMContentLoaded", async () => {
        try {
            const response = await fetch('/check-login', { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                document.querySelector(".login-box h2").textContent = `👋 안녕하세요, ${data.user.username}님!`;
            }
        } catch (error) {
            console.error("로그인 상태 확인 오류:", error);
        }
    });
    
