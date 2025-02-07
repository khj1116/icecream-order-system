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


        

   

       