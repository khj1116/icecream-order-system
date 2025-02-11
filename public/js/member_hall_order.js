const translations = {
    en: {
        "welcome-text": "Welcome! I am Aris, the Ice Cream Robot!",
        "flavor-label": "Choose Flavor:",
        "perform-label": "Choose Performance:",
        "topping-label": "Choose Topping:",
        "submit-button": "Place Order",
        "reset-button": "re-choice",
        "languageButton": "한국어",
        "toggle_font": "Large Font",
        "recommend-title":"💡 Recommend Menu (Recent Orders)",
        "no-orders": "No recent orders found."

    },
    ko: {
        "welcome-text": "어서오세요! 아이스크림 로봇 Aris입니다!",
        "flavor-label": "맛 선택:",
        "perform-label": "퍼포먼스 선택:",
        "topping-label": "토핑 선택:",
        "submit-button": "주문하기",
        "reset-button": "취소",
        "languageButton": "English",
        "toggle_font": "큰 글씨",
        "recommend-title":"💡 추천 메뉴 (최근 주문)",
        "no-orders": "최근 주문 내역이 없습니다."

    }
};

let largeFontMode = sessionStorage.getItem("largeFontMode") === "true";
let currentLanguage = sessionStorage.getItem("language") || "ko";



document.addEventListener("DOMContentLoaded", () => {
    const languageButton = document.getElementById('languageButton');
    const fontButton = document.getElementById('toggle_font');



    //언어 업데이트 함수
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

        // 큰 글씨 버튼 텍스트 업데이트
        if (fontButton) {
            fontButton.textContent = largeFontMode
                ?`${texts["toggle_font"]} OFF`
                : texts["toggle_font"];
        }

        // 추천 메뉴 제목 변경
        const recommendTitle = document.querySelector("#recommendations h3");
        if (recommendTitle) recommendTitle.textContent = texts["recommend-title"];

        // 추천 메뉴 없을 때 메시지 변경
        const recommendBox = document.querySelector("#recommendations p");
        if (recommendBox && recommendBox.textContent.trim() === translations[currentLanguage === "ko" ? "en" : "ko"]["no-orders"]) {
            recommendBox.textContent = texts["no-orders"];
        }





        // 세션 스토리지에 현재 언어 저장 (새로고침해도 유지)
        sessionStorage.setItem("language", currentLanguage);
    };

    //언어 변경 버튼 클릭 이벤트
    if (languageButton) {
        languageButton.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
            updateLanguage();
        });
    }

    //초기언어 적용
    updateLanguage();

    //큰 글씨 모드 초기화 및 버튼 설정
    if (fontButton) {
        if (largeFontMode) {
            document.body.classList.add("large-font");
            document.body.style.overflowY = "auto";
        } else {
            document.body.style.overflowY = "hidden";
        }

        // 큰 글씨 모드 버튼 클릭 이벤트
        fontButton.addEventListener("click", () => {
            largeFontMode = !largeFontMode;
            document.body.classList.toggle("large-font", largeFontMode);
            sessionStorage.setItem("largeFontMode", largeFontMode);

            if (largeFontMode) {
                document.body.style.overflowY = "auto";
                fontButton.textContent = `${translations[currentLanguage]["toggle_font"]} OFF`;

                setTimeout(() => {
                    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
                }, 200);
            } else {
                document.body.style.overflowY = "hidden";
                fontButton.textContent = translations[currentLanguage]["toggle_font"];
            }
        });
    }
});

//최근 주문 내역을 토대로 주문 페이지에서 추천 메뉴로 표시
document.addEventListener("DOMContentLoaded", async () => {
    const user_id = sessionStorage.getItem("user_id"); // 현재 로그인한 회원 ID 가져오기

    if (user_id) {
        try {
            const response = await fetch(`http://localhost:5000/api/recommendations/${user_id}`, { credentials: 'include' });
            const data = await response.json();

            if (data.error) {
                console.error("추천 메뉴 불러오기 실패:", data.error);
                return;
            }

            if (data.message) {
                console.log(data.message);
                return; // 추천 메뉴가 없으면 표시하지 않음
            }

            // 추천 메뉴를 주문 페이지에 표시
            const recommendationContainer = document.getElementById("recommendations");
            if (!recommendationContainer) {
                console.warn("'recommendations' 요소를 찾을 수 없습니다.");
                return;
            }

            let recommendationHTML = `<h3 id="recommend_title">${translations[currentLanguage]["recommend-title"]}</h3><ul>`;
            data.forEach((order) => {
                recommendationHTML += `<li>🍦 ${order.flavor} -  ${order.topping} (${order.orderType})</li>`;
            });
            recommendationHTML += `</ul>`;

            recommendationContainer.innerHTML = recommendationHTML;

        } catch (error) {
            console.error("추천 메뉴 데이터 가져오기 오류:", error);
        }
    }
});


/////////////////////////////////////애니메이션//////////////////////////////////
    document.addEventListener("DOMContentLoaded", () => {
        const orderButton = document.querySelector("#submit-button");

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
        

        
////////////////////////////////////////////////////////////////////////////
    document.addEventListener("DOMContentLoaded", () => {

        console.log("sessionStorage 값 확인:");
        console.log("sessionStorage.getItem('username'):", sessionStorage.getItem("username"));
        console.log("sessionStorage.getItem('user_id'):", sessionStorage.getItem("user_id"));
        
        //회원 이름 가져오기
         
        const usernameDisplay = document.getElementById("user-greeting");  //HTML 요소 가져오기

        if (usernameDisplay) {  // 요소가 존재하는 경우에만 실행
            const username = sessionStorage.getItem("username"); 
            if (username && username !== "undefined" && username !== "null") {
                usernameDisplay.textContent = `${username} 님! 안녕하세요.`;  // 템플릿 리터럴 사용
                console.log("회원 이름 표시:", username); // 디버깅 로그
            } else {
                usernameDisplay.textContent = "환영합니다! 회원 전용 주문 페이지입니다.";
                console.error("SessionStorage에 저장된 username이 없습니다.");
            }
        } else {
            console.error(" 'username' 요소를 찾을 수 없습니다. HTML을 확인하세요.");
        }
    
        const orderForm = document.getElementById("orderForm");
        
    
        if (!orderForm) {
            console.error("❌ 'orderForm' 요소를 찾을 수 없습니다.");
            return;
        }
    
        const message = document.getElementById("message");

        // Socket.IO 연결
        let socket;
        if (typeof io !== "undefined") {
            socket = io('http://localhost:5000/');
            console.log(" Socket.IO 연결 성공");

            // 🔴 기존에 등록된 이벤트가 있다면 제거 (이중 등록 방지)
            socket.off("update_orders");

            // ✅ 주문 내역 실시간 업데이트 리스너 등록
            socket.on("update_orders", (orders) => {
                console.log("🔄 실시간 주문 내역 업데이트 수신:", orders);
                updateOrderList(orders);
            });


        } else {
            console.error("❌ Socket.IO가 로드되지 않았습니다. HTML에 `<script src='https://cdn.socket.io/4.0.1/socket.io.min.js'></script>` 추가하세요.");
            return; // ⚠️ Socket.IO가 없으면 실행 중단
        }




        // 주문 제출 이벤트 리스너 추가
        orderForm.addEventListener('submit', async (event) => {
            event.preventDefault();


            // 요소가 존재하는지 확인
            const flavor = document.getElementById('flavor');
            const perform = document.getElementById('perform');
            const topping = document.getElementById('topping');
            const user_id = sessionStorage.getItem("user_id");
            const user_name = sessionStorage.getItem("username");

            if (!flavor || !perform || !topping || !user_id) {
                console.error('필수 요소가 누락되었습니다. HTML 구조를 확인하세요.');
                console.log('flavor:', flavor);
                console.log('perform:', perform);
                console.log('topping:', topping);
                console.log('user_id:', user_id)
               
                return;
            }

            //주문 데이터 구성(요소가 존재하는지 확인)
            const order = {
                flavor: flavor.value,
                perform: perform.value,
                topping: topping.value,
                orderType: 'hall',  //매장주문 데이터 추가
                username: sessionStorage.getItem("username"),
                user_id: sessionStorage.getItem("user_id")
                  
            };

            console.log('서버로 전송할 주문 데이터:', order);


            // 서버로 데이터 전송
            try {
                const response = await fetch('http://localhost:5000/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order),
                    credentials: "include" //cors문제 방지
                });
                console.log("서버 응답 상태:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("서버응답오류:", errorText)
                    message.textContent = currentLanguage === 'en'
                    ? "Order submission failed."
                    : "주문 접수에 실패했습니다.";
                } else {

                    const result = await response.json();
                    console.log("✅ 주문 성공:", result);
                    message.textContent = currentLanguage === 'en'
                    ? "Your order has been successfully placed!"
                    : "주문이 성공적으로 접수되었습니다!";

                    // ✅ 주문이 성공한 후에만 `orderSubmitted` 설정
                    sessionStorage.setItem("orderSubmitted", "true");
                   
                    orderForm.reset();
                }
                    
            } catch (error) {
                message.textContent = currentLanguage === 'en' 
                ? "Unable to connect to the server."
                : "서버와 연결할 수 없습니다."; 
                console.error('Error:', error);
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

    // 주문 목록 업데이트 함수
    function updateOrderList(orders) {
        const orderTable = document.getElementById("order-list");
        if (!orderTable) {
            console.error("❌ 'order-list' 요소를 찾을 수 없습니다.");
            return;
        }

        orderTable.innerHTML = ""; // 기존 내용 초기화
        orders.forEach((order) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.flavor}</td>
                <td>${order.perform}</td>
                <td>${order.topping}</td>
                <td>${order.orderType}</td>
                <td>${order.customer_name}</td>
            `;
            orderTable.appendChild(row);
        });
    }

});


        

   
    
//로그인 유지 기능을 프론트 엔드에 추가
document.addEventListener("DOMContentLoaded", async () => {
    // sessionStorage에 username이 없으면 서버에서 가져옴
    if (!sessionStorage.getItem("username")) {
        try {
            const response = await fetch('/check-login', { credentials: 'include' });
            const data = await response.json();

            if (data.success && data.user.username) {
                sessionStorage.setItem("username", data.user.username); // sessionStorage에 저장
                sessionStorage.setItem("user_id", data.user.user_id);
                console.log("서버에서 사용자 정보 가져와서 sessionStorage에 저장 완료");
            }
        } catch (error) {
            console.error("로그인 상태 확인 오류:", error);
        }
    }

    // 저장된 username을 페이지에 표시
    const usernameDisplay = document.getElementById("username");
    const username = sessionStorage.getItem("username");

    if (usernameDisplay) {
        usernameDisplay.textContent = username ? `👤 ${username}님, 안녕하세요!` : "👤 환영합니다! 회원 전용 주문 페이지입니다.";
    }
});

//취소버튼
document.addEventListener("DOMContentLoaded", () => {
    const orderForm = document.getElementById('orderForm');
    const message = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    let currentLanguage = 'ko';

    const translations = {
        en: {
            resetMessage: "Please select your menu again!"
        },
        ko: {
            resetMessage: "다시 메뉴를 선택해주세요!"
        }
    };

    // 언어 변경 버튼 클릭 시 상태 업데이트
    document.getElementById('languageButton').addEventListener("click", () => {
        currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
    });

    // 주문 취소 버튼 클릭 시 메시지 표시
    resetButton.addEventListener("click", () => {
        message.textContent = translations[currentLanguage].resetMessage;
        message.classList.add("error-message");

        // 1초 후 메시지 사라지게 설정 (선택 사항)
        setTimeout(() => {
            message.textContent = "";
            message.classList.remove("error-message");
        }, 1000);
    });
});

        
   

       