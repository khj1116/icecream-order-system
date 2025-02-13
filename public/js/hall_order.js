document.addEventListener("DOMContentLoaded", () => {
    const languageButton = document.getElementById('languageButton');
    const fontButton = document.getElementById('toggle_font');

    let largeFontMode = sessionStorage.getItem("largeFontMode") === "true";
    let currentLanguage = sessionStorage.getItem("language") || 'ko';

    const translations = {
        en: {
            "welcome-text": "Welcome! I am Aris, the Ice Cream Robot!",
            "flavor-label": "Choose Flavor:",
            "perform-label": "Choose Performance:",
            "topping-label": "Choose Topping:",
            "ToppingType": "Choose Topping Type",
            "submit-button": "Place Order",
            "reset-button": "re-choice",
            "topping_up": "topping on icecream",
            "topping_under": "topping under icecream",
            "language-button": "한국어",
            "toggle_font": "Large font"

        },
        ko: {
            "welcome-text": "어서오세요! 아이스크림 로봇 Aris입니다!",
            "flavor-label": "맛 선택:",
            "perform-label": "퍼포먼스 선택:",
            "topping-label": "토핑 선택:",
            "ToppingType": "제조 순서 선택",
            "submit-button": "주문하기",
            "reset-button": "취소",
            "topping_up": "아이스크림 위에 토핑",
            "topping_under": "아이스크림 밑에 토핑",
            "language-button": "English",
            "toggle_font": "큰 글씨"


        }
    };

    //언어 업데이트 함수
    const updateLanguage = () => {
        const texts = translations[currentLanguage];
        //기존 텍스트 변경
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

        //큰 글씨 버튼 텍스트 업데이트
        if (fontButton) {
            fontButton.textContent = largeFontMode
            ? `${text["toggle_font"]} OFF`
            : texts["toggle_font"];
        }

        //세션 스토리지에 현재 언어 저장(새로고침해도 유지)
        sessionStorage.setItem("language", currentLanguage);
        console.log("언어 변경 완료:", currentLanguage);

    };

    //언어 변경 버튼 클릭 이벤트
    if (languageButton) {
        languageButton.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
            sessionStorage.setItem("language", currentLanguage);
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

    
//////////////////////////////////////////////애니메이션/////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        
        
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 주문 제출 이벤트
        const orderForm = document.getElementById('orderForm');
        const message = document.getElementById('message');
        const registerButton = document.getElementById('registerButton');

        let currentLanguage = sessionStorage.getItem("language") || "ko";

       
        orderForm.addEventListener('submit', async (event) => {
            event.preventDefault();


            // 요소가 존재하는지 확인
            const flavor = document.getElementById('flavor');
            const perform = document.getElementById('perform');
            const topping = document.getElementById('topping');
            const message = document.getElementById('message');
            const orderSequence = document.querySelector('input[name="order_sequence"]:checked');

            if (!flavor || !perform || !topping) {
                console.error('필수 요소가 누락되었습니다. HTML 구조를 확인하세요.');
                console.log('flavor:', flavor);
                console.log('perform:', perform);
                console.log('topping:', topping);
               
                return;
            }

            if (!orderSequence) {
                message.textContent = "주문 순서를 선택해주세요!";
                message.classList.add("error-message");
                return;
            }

            //주문 데이터 구성
            const order = {
                flavor: flavor.value,
                perform: perform.value,
                topping: topping.value,
                orderType: 'hall',  //매장 또는 포장 주문 데이터 추가
                username: null,
                order_sequence: orderSequence.value, // 로보이 먼저 or 토핑 먼저
                  
            };

            console.log('서버로 전송할 주문 데이터:', order);


            // 서버로 데이터 전송
            try {
                const response = await fetch('http://localhost:5000/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order),
                });

                console.log("서버 응답 상태:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("서버 응답 오류:", errorText);
                    message.innerText = currentLanguage === 'en'
                        ? "Order submission failed."
                        : "주문 접수에 실패했습니다.";
                    message.classList.add("error-message");
                    return;
                } 
                    const result = await response.json();
                    console.log("주문 성공:", result);
        
                    // 주문 성공 메시지 표시
                    message.innerText = currentLanguage === 'en'
                        ? "Your order has been successfully placed!"
                        : "주문이 성공적으로 접수되었습니다!";
                    message.classList.add("success-message");
        
                    // 일정 시간 후 메시지 사라지도록 설정 (예: 3초 후)
                    setTimeout(() => {
                        message.textContent = "";
                        message.classList.remove("success-message");
                    }, 3000);
        
                    // 주문이 성공한 후에만 `orderSubmitted` 설정
                    sessionStorage.setItem("orderSubmitted", "true");
        
                    // 폼 초기화
                    orderForm.reset();

                
            } catch (error) {
                console.error("주문 요청 중 오류 발생:", error);
                message.textContent = currentLanguage === 'en' 
                    ? "Unable to connect to the server."
                    : "서버와 연결할 수 없습니다."; 
                message.classList.add("error-message");
            }
        });

        

        document.addEventListener("DOMContentLoaded", () => {
            const orderForm = document.getElementById('orderForm');
            // const message = document.getElementById('message');
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

        



        

   

       