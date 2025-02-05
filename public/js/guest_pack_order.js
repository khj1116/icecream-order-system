document.addEventListener("DOMContentLoaded", () => {
    const orderForm = document.getElementById("orderForm");
    

    if (!orderForm) {
        console.error("❌ 'orderForm' 요소를 찾을 수 없습니다. HTML을 확인하세요.");
        return; // 🔴 `orderForm`이 없으면 실행 중단
    }

    const message = document.getElementById("message");

    // // 브라우저 뒤로가기 시 기본값 자동 제출 방지
    // if (window.performance && window.performance.navigation.type === 2) {
    //     console.log("뒤로가기 감지됨 - 자동 제출 방지");
    //     sessionStorage.removeItem("orderSubmitted"); // 중복 주문 방지
    //     window.history.replaceState({}, document.title, window.location.pathname);
    // }



    // Socket.IO 연결 (에러 방지)
    let socket;
    if (typeof io !== "undefined") {
        socket = io('http://localhost:5000/');
        console.log("✅ Socket.IO 연결 성공");
    } else {
        console.error("Socket.IO가 로드되지 않았습니다. HTML에 `<script src='https://cdn.socket.io/4.0.1/socket.io.min.js'></script>` 추가하세요.");
        return; // ⚠️ Socket.IO가 없으면 실행 중단
    }
    

    //주문 제출 이벤트 리스너 추가
    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        
        const order = {
            flavor: document.getElementById("flavor")?.value,
            perform: document.getElementById("perform")?.value,
            topping: document.getElementById("topping")?.value,
            orderType: "packed",
            username: "비회원",
            user_id: null
        };
    
        console.log("📤 서버로 전송할 주문 데이터:", order);
    
        try {
            const response = await fetch("http://localhost:5000/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
                credentials: "include"
            });
    
            console.log("📩 서버 응답 상태:", response.status);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ 서버 응답 오류:", errorText);
                message.textContent = `❌ 주문 접수 실패: ${errorText}`;
                return;
            }
    
            const result = await response.json();
            console.log("✅ 주문 성공:", result);
            message.textContent = "✅ 주문이 성공적으로 접수되었습니다!";
    
            // ✅ 주문 성공 후에만 `orderSubmitted`를 `true`로 설정
            sessionStorage.setItem("orderSubmitted", "true");
    
            orderForm.reset();
    
            // // ✅ 주문 성공 시 실시간 업데이트 요청
            // socket.emit("new_order", order);
    
        } catch (error) {
            console.error("🚨 주문 요청 중 오류 발생:", error);
            message.textContent = "❌ 서버와 연결할 수 없습니다.";
        }
    });

    // 뒤로 가기 시 sessionStorage 초기화
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            console.log("페이지 복원 감지됨 - sessionStorage 초기화");
            sessionStorage.removeItem("orderSubmitted");
        }
    });

    // 페이지 떠날 때 sessionStorage 초기화
    window.addEventListener("beforeunload", function () {
        sessionStorage.removeItem("orderSubmitted");
    });
});