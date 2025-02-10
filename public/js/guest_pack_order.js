document.addEventListener("DOMContentLoaded", () => {
    const orderForm = document.getElementById("orderForm");
    

    if (!orderForm) {
        console.error("'orderForm' 요소를 찾을 수 없습니다. HTML을 확인하세요.");
        return; //  `orderForm`이 없으면 실행 중단
    }

    const message = document.getElementById("message");



    // Socket.IO 연결 (에러 방지)
    let socket;
    if (typeof io !== "undefined") {
        socket = io('http://localhost:5000/');
        console.log("Socket.IO 연결 성공");
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
    
            console.log("서버 응답 상태:", response.status);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("서버 응답 오류:", errorText);
                message.textContent = `주문 접수 실패: ${errorText}`;
                return;
            }
    
            const result = await response.json();
            console.log("주문 성공:", result);
            message.textContent = result.message || "주문이 성공적으로 접수되었습니다!";
    
            // 주문 성공 후에만 `orderSubmitted`를 `true`로 설정
            sessionStorage.setItem("orderSubmitted", "true");



    
            // `orderForm`이 존재하고, <form> 요소일 경우에만 reset 실행
            if (orderForm && typeof orderForm.reset === "function") {
                orderForm.reset();
            } else {
                console.warn("orderForm이 <form> 요소가 아니거나 reset() 메서드가 없습니다.");

                // 개별 필드 초기화
                document.getElementById("flavor").value = "";
                document.getElementById("perform").value = "";
                document.getElementById("topping").value = "";
            }
    
        } catch (error) {
            console.error("주문 요청 중 오류 발생:", error);
            message.textContent = "서버와 연결할 수 없습니다.";
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
///////////////////언어변경/////////////////////////////////
const languageButton = document.getElementById('languageButton');
        const translations = {
            en: {
                "guest-order": "Pick-up Order Page",
                "flavor-label": "Choose Flavor:",
                "perform-label": "Choose Performance:",
                "topping-label": "Choose Topping:",
                "submit": "Place Order",
                "reset": "re-choice",
                "languageButton": "한국어"
            },
            ko: {
                "welcome-text": "어서오세요! 아이스크림 로봇 Aris입니다!",
                "flavor-label": "맛 선택:",
                "perform-label": "퍼포먼스 선택:",
                "topping-label": "토핑 선택:",
                "submit": "주문하기",
                "reset": "취소",
                "languageButton": "English"

            }
        };

        let currentLanguage = 'ko';

        const updateLanguage = () => {
            const texts = translations[currentLanguage];
            for (const id in texts) {
                const element = document.getElementById(id);
                if (element) element.textContent = texts[id];
            }

            // Update options
            document.querySelectorAll('option').forEach(option => {
                const text = option.getAttribute(`data-${currentLanguage}`);
                if (text) option.textContent = text;
            });
        };


        languageButton.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
            updateLanguage();

        });

        updateLanguage();
///////////////애니메이션///////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const orderButton = document.querySelector("#submit");

    orderButton.addEventListener("click", (event) => {
        // 아이스크림 이모지를 생성
        const icecream = document.createElement("div");
        icecream.textContent = "🍦";
        icecream.classList.add("icecream-fall");

         // 버튼 내부에서 떨어지도록 설정
        orderButton.appendChild(icecream);

        // 애니메이션 후 요소 제거
        setTimeout(() => {
            icecream.remove();
        }, 1000); // 애니메이션 시간 후 삭제
    });
});

