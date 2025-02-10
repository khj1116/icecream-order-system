const languageButton = document.getElementById('languageButton');
        const translations = {
            en: {
                "welcome-text": "Welcome! I am Aris, the Ice Cream Robot!",
                "flavor-label": "Choose Flavor:",
                "perform-label": "Choose Performance:",
                "topping-label": "Choose Topping:",
                "submit-button": "Place Order",
                "reset-button": "re-choice",
                "registerButton": "Register Loyal Customer",
                "languageButton": "한국어"
            },
            ko: {
                "welcome-text": "어서오세요! 아이스크림 로봇 Aris입니다!",
                "flavor-label": "맛 선택:",
                "perform-label": "퍼포먼스 선택:",
                "topping-label": "토핑 선택:",
                "submit-button": "주문하기",
                "reset-button": "취소",
                "registerButton": "단골 손님 등록",
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
        
        

        // // 창 크기 변경 시 캔버스 크기 업데이트
        // window.addEventListener('resize', () => {
        //     canvas.width = window.innerWidth;
        //     canvas.height = window.innerHeight;

        //     particles.length = 0;  //기존 배열 초기화
        //     for (let i = 0; i < 150; i++) {
        //         particles.push(new Particle());   //새로운 파티클 추가
        //     }
        // });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 주문 제출 이벤트
        const orderForm = document.getElementById('orderForm');
        const message = document.getElementById('message');
        const registerButton = document.getElementById('registerButton');

       
        orderForm.addEventListener('submit', async (event) => {
            event.preventDefault();


            // 요소가 존재하는지 확인
            const flavor = document.getElementById('flavor');
            const perform = document.getElementById('perform');
            const topping = document.getElementById('topping');

            if (!flavor || !perform || !topping) {
                console.error('필수 요소가 누락되었습니다. HTML 구조를 확인하세요.');
                console.log('flavor:', flavor);
                console.log('perform:', perform);
                console.log('topping:', topping);
               
                return;
            }

            //주문 데이터 구성
            const order = {
                flavor: flavor.value,
                perform: perform.value,
                topping: topping.value,
                orderType: 'hall',  //매장 또는 포장 주문 데이터 추가
                username: null
                  
            };

            console.log('서버로 전송할 주문 데이터:', order);


            // 서버로 데이터 전송
            try {
                const response = await fetch('http://localhost:5000/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order),
                });

                if (response.ok) {
                    
                    message.textContent = currentLanguage === 'en'
                        ? "Your order has been successfully placed!"
                        : "주문이 성공적으로 접수되었습니다!";
                    orderForm.reset();

                } else {
                    message.textContent = currentLanguage === 'en'
                        ? "Order submission failed."
                        : "주문 접수에 실패했습니다.";
                }
                    
            } catch (error) {
                message.textContent = currentLanguage === 'en' 
                ? "Unable to connect to the server."
                : "서버와 연결할 수 없습니다."; 
                console.error('Error:', error);
            }
        });

        //회원 접속 시 환영 메시지 표시
        window.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const username = params.get('username');
        
            if (username) {
                const welcomeMessage = document.getElementById('welcome-message');
                welcomeMessage.textContent = `${username}님! 안녕하세요`;
            }
        });

        /*커밋*/

        document.addEventListener("DOMContentLoaded", async () => {
            const usernameDisplay = document.getElementById("username");
            const recommendationBox = document.getElementById("recommendations");
        
            // 저장된 user_id 가져오기
            const userId = sessionStorage.getItem("user_id");
        
            if (!userId) {
                console.error("로그인된 사용자 정보 없음!");
                return;
            }
        
            console.log(`🔍 로그인한 사용자: ${userId}`);
        
            // 🔹 회원 정보 가져오기
            try {
                const response = await fetch(`http://localhost:5000/api/get-user-info/${userId}`);
                const data = await response.json();
        
                if (data.success) {
                    usernameDisplay.textContent = `${data.username}님! 안녕하세요!`;
                } else {
                    console.error("회원 정보 로드 실패:", data.message);
                }
            } catch (error) {
                console.error("회원 정보 요청 오류:", error);
            }
        
            // 🔹 추천 메뉴 가져오기
            try {
                const res = await fetch(`http://localhost:5000/api/recommendations/${userId}`);
                const menuData = await res.json();
        
                if (menuData.length > 0) {
                    recommendationBox.innerHTML = `
                        <h3>🍨 ${userId}님의 추천 메뉴</h3>
                        <ul>
                            ${menuData.map(item => `<li>${item.flavor} + ${item.perform} + ${item.topping}</li>`).join('')}
                        </ul>
                    `;
                } else {
                    recommendationBox.innerHTML = `<p>최근 주문 내역이 없습니다.</p>`;
                }
            } catch (error) {
                console.error("추천 메뉴 요청 오류:", error);
            }
        });


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



        

   

       