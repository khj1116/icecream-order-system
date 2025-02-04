document.addEventListener("DOMContentLoaded", () => {
    // URL에서 username 가져오기
    //const params = new URLSearchParams(window.location.search);
    const username = sessionStorage.getItem("username");  //회원 이름 가져오기
    const welcomeText = document.getElementById("welcome-text");

    if (username && username !== "undefined" && username !== "null") {
        welcomeText.textContent = "${username} 회원님! 안녕하세요.";
        console.log("회원 이름 표시:", username) //디버깅 로그
    } else {
        welcomeText.textContent = "환영합니다! 회원 전용 주문 페이지입니다.";
        console.error("SessionStorage에 저장된 username이 없습니다.");
    }

    const orderForm = document.getElementById("orderForm");
    const message = document.getElementById("message");

    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const user_id = sessionStorage.getItem("user_id"); // 로그인 시 저장된 ID
        const username = sessionStorage.getItem("username");  //로그인한 사용자 이름

        const order = {
            flavor: document.getElementById("flavor").value,
            perform: document.getElementById("perform").value,
            topping: document.getElementById("topping").value,
            orderType: "packed",  // 포장 주문으로 설정
            username: username, //로그인한 회원 이름 추가
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
});
