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
        
      
        //동적 배경 코드
        const canvas = document.getElementById('backgroundCanvas');
        const ctx = canvas.getContext('2d');

        //캔버스 크기 설정
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        //파티클 배열
        const particles = [];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.scale = Math.random() * 2 + 1;  //scale 초기화 추가
                this.dx = (Math.random() - 0.5) * 2;
                this.dy = (Math.random() - 0.5) * 2;
            }

            draw() {
                const spikes = 5; //별의 꼭짓점 수
                const outerRadius = 5 * this.scale;
                const innerRadius = outerRadius / 2.5;
                const step = Math.PI / spikes;

                ctx.beginPath();
                let rotation = Math.PI / 2 * 3; // 시작 회전 각도
                let x = this.x;
                let y = this.y;

                ctx.moveTo(this.x, this.y - outerRadius);

                for (let i = 0; i < spikes; i++) {
                    x = this.x + Math.cos(rotation) * outerRadius;
                    y = this.y + Math.sin(rotation) * outerRadius;
                    ctx.lineTo(x, y);
                    rotation += step;

                    x = this.x + Math.cos(rotation) * innerRadius;
                    y = this.y + Math.sin(rotation) * innerRadius;
                    ctx.lineTo(x, y);
                    rotation += step;
                }

                ctx.lineTo(this.x, this.y - outerRadius);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 0, 127, 0.8)';
                ctx.fill();
                }

            update() {
                this.x += this.dx;
                this.y += this.dy;

                //경계에 부딪히면 방향 반전
                if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
                this.draw();
            }
        }

        // 파티클 생성
        for (let i = 0; i < 150; i++) {
            particles.push(new Particle());
        }

        // 애니메이션 루프
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => particle.update());
            requestAnimationFrame(animate);
        }

        animate();

        // 창 크기 변경 시 캔버스 크기 업데이트
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            particles.length = 0;  //기존 배열 초기화
            for (let i = 0; i < 150; i++) {
                particles.push(new Particle());   //새로운 파티클 추가
            }
        });
////////////////////////////////////////////////////////////////////////////
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

//최근 주문 내역을 토대로 주문 페이지에서 추천 메뉴로 표시
document.addEventListener("DOMContentLoaded", async () => {
    const user_id = sessionStorage.getItem("user_id"); // 현재 로그인한 회원 ID 가져오기

    if (user_id) {
        try {
            const response = await fetch(`http://localhost:5000/api/recommendations/${user_id}`, { credentials: 'include' });
            const data = await response.json();

            if (data.error) {
                console.error("🚨 추천 메뉴 불러오기 실패:", data.error);
                return;
            }

            if (data.message) {
                console.log(data.message);
                return; // 추천 메뉴가 없으면 표시하지 않음
            }

            // 📢 추천 메뉴를 주문 페이지에 표시
            const recommendationContainer = document.getElementById("recommendations");
            if (!recommendationContainer) {
                console.warn("⚠️ 'recommendations' 요소를 찾을 수 없습니다.");
                return;
            }

            let recommendationHTML = `<h3>추천 메뉴 (최근 주문)</h3><ul>`;
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
        

   
    
//로그인 유지 기능을 프론트 엔드에 추가
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/check-login', { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            const loginBoxHeader = document.querySelector(".login-box h2");
            if (loginBoxHeader) { // 요소가 존재하는지 확인 후 설정
                loginBoxHeader.textContent = `👋 안녕하세요, ${data.user.username}님!`;
               
            } else {
                console.warn("⚠️ '.login-box h2' 요소를 찾을 수 없습니다. HTML 구조를 확인하세요.");
            }
        }
    } catch (error) {
        console.error("로그인 상태 확인 오류:", error);
    }
});


        
   

       