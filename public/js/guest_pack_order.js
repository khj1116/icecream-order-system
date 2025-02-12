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

        // 요소가 존재하는지 확인
        const flavor = document.getElementById('flavor');
        const perform = document.getElementById('perform');
        const topping = document.getElementById('topping');
        const orderSequence = document.querySelector('input[name="order_sequence"]:checked');

        if (!flavor || !perform || !topping || !orderSequence) {
            console.error('필수 요소가 누락되었습니다. HTML 구조를 확인하세요.');
            message.textContent = "모든 항목을 선택해주세요!";
            message.classList.add("error-message");
            return;
        }
    
        
        const order = {
            flavor: flavor.value,
            perform: perform.value,
            topping: topping.value,
            orderType: "packed",
            username: "비회원",
            user_id: null,
            order_sequence: orderSequence.value, // 로보이 먼저 or 토핑 먼저
        };
    
        console.log("서버로 전송할 주문 데이터:", order);
    
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
                message.textContent = (sessionStorage.getItem("language") === 'en')
                    ? "Order submission failed."
                    : "주문 접수에 실패했습니다.";
                message.classList.add("error-message");
            } else {
                const result = await response.json();
                console.log("주문 성공:", result);

                // 현재 언어 가져오기
                const lang = sessionStorage.getItem("language") || "ko";
                console.log("현재 언어 상태:", lang);

                message.textContent = lang === "en"
                    ? "Your order has been successfully placed!"
                    : "주문이 성공적으로 접수되었습니다!";
                message.classList.add("success-message");

                // 일정 시간 후 메시지 사라지도록 설정 (예: 3초 후)
                setTimeout(() => {
                    message.textContent = "";
                    message.classList.remove("success-message");
                }, 3000);

                // 주문 성공 후에만 `orderSubmitted`를 `true`로 설정
                sessionStorage.setItem("orderSubmitted", "true");
                // 🔹 orderForm이 존재하는 경우에만 reset 실행
                if (orderForm && typeof orderForm.reset === "function") {
                    orderForm.reset();
                } else {
                    console.error("orderForm이 정상적인 <form> 요소가 아닙니다.");
                }

            }

        } catch (error) {
            console.error('주문 요청 중 오류 발생:', error);
            message.textContent = (sessionStorage.getItem("language") === 'en')
            ? "Unable to connect to the server."
            : "서버와 연결할 수 없습니다.";
       
            message.classList.add("error-message");
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
                "ToppingType": "Choose Topping type",
                "submit": "Place Order",
                "reset": "re-choice",
                "topping_up": "topping on icecream",
                "topping_under": "topping under icecream",
                "languageButton": "한국어"
            },
            ko: {
                "guest-order": "포장 주문 페이지",
                "flavor-label": "맛 선택:",
                "perform-label": "퍼포먼스 선택:",
                "topping-label": "토핑 선택:",
                "ToppingType": "제조 순서 선택",
                "submit": "주문하기",
                "reset": "취소",
                "topping_up": "아이스크림 위에 토핑",
                "topping_under": "아이스크림 밑에 토핑",
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

            // 제조 순서 라벨 텍스트 변경 (이미지 유지)
            document.querySelector(".order-sequence").innerHTML = `
            <label id="topping_up" class="sequence-option">
                <input type="radio" name="order_sequence" value="icecream_first" required>
                <img src="/images/on.png" alt="${texts["topping_up"]}">
                <span>${texts["topping_up"]}</span>
            </label>

            <label id="topping_under" class="sequence-option">
                <input type="radio" name="order_sequence" value="topping_first" required>
                <img src="/images/under.png" alt="${texts["topping_under"]}">
                <span>${texts["topping_under"]}</span>
            </label>
        `;
            //세션 스토리지에 현재 언어 저장(새로고침해도 유지)
            sessionStorage.setItem("language", currentLanguage);
            console.log("언어 변경 완료:", currentLanguage);

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
////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM 로드 완료");

    const orderSequenceDiv = document.querySelector(".order-sequence");

    if (!orderSequenceDiv) {
        console.error("'order-sequence' 요소를 찾을 수 없음!");
        return;
    }

    // 초기 이미지 추가 (언어에 따라 텍스트 설정)
    const texts = translations[currentLanguage];


    // 이미지가 없을 경우 강제 추가
    orderSequenceDiv.innerHTML = `
        <label id="topping_up" class="sequence-option">
            <input type="radio" name="order_sequence" value="icecream_first" required>
            <img src="/images/on.png" alt="${texts["topping_up"]}">
            <span>${texts["topping_up"]}</span>
        </label>

        <label id="topping_under" class="sequence-option">
            <input type="radio" name="order_sequence" value="topping_first" required>
            <img src="/images/under.png" alt="${texts["topping_under"]}">
            <span>${texts["topping_under"]}</span>
        </label>
    `;

    console.log("이미지 추가 완료!");
});


