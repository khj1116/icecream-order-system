// // 파티클 배경 효과
// const backgroundCanvas = document.getElementById("background");
// const ctx = backgroundCanvas.getContext("2d");
// backgroundCanvas.width = window.innerWidth;
// backgroundCanvas.height = window.innerHeight;

// const particles = [];
// const particleCount = 100;

// class Particle {
//     constructor(x, y, size, speedX, speedY, color) {
//         this.x = x;
//         this.y = y;
//         this.size = size;
//         this.speedX = speedX;
//         this.speedY = speedY;
//         this.color = color;
//     }

//     draw() {
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.fillStyle = this.color;
//         ctx.fill();
//     }

//     update() {
//         this.x += this.speedX;
//         this.y += this.speedY;

//         if (this.x < 0 || this.x > backgroundCanvas.width) this.speedX *= -1;
//         if (this.y < 0 || this.y > backgroundCanvas.height) this.speedY *= -1;
//     }
// }

// function initParticles() {
//     for (let i = 0; i < particleCount; i++) {
//         const size = Math.random() * 3 + 1;
//         const x = Math.random() * backgroundCanvas.width;
//         const y = Math.random() * backgroundCanvas.height;
//         const speedX = (Math.random() - 0.5) * 2;
//         const speedY = (Math.random() - 0.5) * 2;
//         const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`;
//         particles.push(new Particle(x, y, size, speedX, speedY, color));
//     }
// }

// function animateBackground() {
//     ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
//     particles.forEach((particle) => {
//         particle.update();
//         particle.draw();
//     });
//     requestAnimationFrame(animateBackground);
// }

// initParticles();
// animateBackground();

// // 캔버스 크기 변경 시 조정
// window.addEventListener("resize", () => {
//     backgroundCanvas.width = window.innerWidth;
//     backgroundCanvas.height = window.innerHeight;
//     particles.length = 0;
//     initParticles();
// });

// // 기존 회원 등록 기능
// const video = document.getElementById('video');
// const canvas = document.getElementById('canvas');
// const captureButton = document.getElementById('capture');
// const registerButton = document.getElementById('member-register');
// const submitButton = document.getElementById('submit');
// const backButton = document.getElementById('back');
// const inputFields = document.getElementById('input-fields');
// const context = canvas.getContext('2d');
// let capturedImages = 0;

// //카메라 초기화
// navigator.mediaDevices.getUserMedia({ video: true })
//     .then((stream) => {
//         video.srcObject = stream;  //비디오 스트림 연결
//     })
//     .catch((err) => {
//         alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.")
//         console.error("카메라 접근 오류.", err);
//     });

// registerButton.addEventListener('click', () => {
//     inputFields.style.display = 'block';  //입력창 표시
//     captureButton.style.display = 'inline-block'; //사진찍기 버튼 표시
//     registerButton.style.display = 'none';  //회원 등록 버튼 숨기기
// });

// // 사진 자동 촬영 및 등록
// captureButton.addEventListener('click', async () => {
//     const maxImages = 10;
//     capturedImages = []; //배열 초기화

//     alert("회원 얼굴 촬영을 시작합니다. 카메라를 응시해주세요.");
//     const captureInterval = setInterval(async () => {
//         if (capturedImages >= maxImages) {
//             clearInterval(captureInterval); //캡처 완료 시 인터벌 정지
//             alert(`${maxImages}장의 사진을 캡처했습니다.`);
//             return;
//         }

//         context.drawImage(video, 0, 0, canvas.width, canvas.height);
//         const imageData = canvas.toDataURL('image/png');


    




// // 서버로 이미지 전송
//         try {
//             const response = await fetch('http://localhost:5000/capture', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ image: imageData })
//             });

//             if (response.ok) {
//                 capturedImages.push(imageData); //이미지 데이터를 배열에 저장
//                 console.log(`사진 ${capturedImages.length}/${maxImages} 캡처 완료`);
//             } else {
//                 console.error("사진 캡처 실패");
//                 clearInterval(captureInterval);
//             }
//         } catch (error) {
//             console.error("서버와 연결할 수 없습니다.", error);
//             clearInterval(captureInterval);
//         }
//     }, 10); // 0.1초 간격으로 캡처
// });

// //등록 버튼 동작
// submitButton.addEventListener('click', async () => {
//     const name = document.getElementById('name').value;
//     const user_id = document.getElementById('user_id').value;
//     const password = document.getElementById('password').value;
    

//     //capturedImages 배열이 제대로 생성되었는지 확인
//     console.log("캡쳐된 이미지 데이터 확인:", capturedImages);

//     //모든 필 수 데이터 입력 확인

//     if (!name || !user_id || !password || capturedImages.length === 0) {
//         alert("모든 정보를 입력하고 등록해주세요.");
//         return;
//     }

//     console.log('등록 요청 데이터:', { user_id });

//     //1. 얼굴 등록 요청
  
        
//     const formData = new FormData();
//     formData.append('user_id' , user_id);
//     for (const [index, image] of capturedImages.entries()) {
//         const blob = await fetch(image).then((res) => res.blob());
//         formData.append('images', blob, `image-${index}.png`);
//     }

//     //서버로 데이터 전송
//     try {
//         const faceResponse = await fetch('http://localhost:5003/register-face', {
//             method: 'POST',
//             body: formData,
//         });

//         if (!faceResponse.ok){
//             const errorData = await faceResponse.json();
//             alert(`얼굴 등록 실패: ${errorData.error}`);
//             return;
//         }
//         const faceData = await faceResponse.json();
//         console.log('얼굴 등록 성공:', faceData);

//         // 2. 회원 정보 등록 요청
//         const userResponse = await fetch('http://localhost:5000/register-user', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ username: name, user_id, password }),
//         });

//         if (!userResponse.ok) {
//             const errorData = await userResponse.json();
//             alert(`회원 정보 등록 실패: ${errorData.error}`);
//             return;
//         }
        
//         const userData = await userResponse.json();
//         alert(`회원 등록 성공: ${userData.message}`);
//     } catch (error) {
//         console.error("등록 중 오류가 발생했습니다:", error);
//         alert("등록 중 오류가 발생했습니다.");
//     }
// });

// backButton.addEventListener('click', () => {
//     window.location.href = 'order.html';   //메인 페이지로 이동
// });