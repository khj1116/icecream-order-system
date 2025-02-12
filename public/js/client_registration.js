document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded - 회원가입 페이지 로드됨");

    const registerForm = document.querySelector("#registerForm");
    const messageBox = document.querySelector("#message");
    const webcam = document.querySelector("#webcam");
    const canvas = document.querySelector("#capturedCanvas");
    const captureButton = document.querySelector("#captureButton");

    let capturedImage = null; 

    // 요소가 존재하는지 확인 후 실행
    if (!registerForm || !messageBox || !webcam || !canvas || !captureButton) {
        console.error("필수 요소가 누락되었습니다. HTML을 확인하세요.");
        return;
    }

    // 이전 로그인 페이지 기억하기 (URL에서 from 값을 가져옴)
    const urlParams = new URLSearchParams(window.location.search);
    const previousPage = urlParams.get("from");

    if (previousPage) {
        console.log(`이전 페이지 저장: ${previousPage}`);
        sessionStorage.setItem("previousPage", previousPage); // 이전 로그인 페이지 저장
    }



    // 1.웹캠 활성화
    async function startWebcam() {
        try {
            console.log("웹캠 활성화 시작...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcam.srcObject = stream;
            console.log("웹캠 활성화 성공");
        } catch (error) {
            console.error("웹캠 접근 오류:", error);
            messageBox.textContent = "웹캠에 접근할 수 없습니다.";
        }
    }
    startWebcam();

    // 2.얼굴 촬영 기능
    captureButton.addEventListener("click", () => {
    try {
        console.log("얼굴 촬영 시작...");
        const context = canvas.getContext("2d");
        canvas.width = webcam.videoWidth;
        canvas.height = webcam.videoHeight;
        context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
        capturedImage = canvas.toDataURL("image/jpeg"); 
        messageBox.textContent = "얼굴 촬영 완료!";
        console.log("얼굴 촬영 성공");
    } catch (error) {
        console.error("얼굴 촬영 오류:", error);
        messageBox.textContent = "얼굴 촬영에 실패했습니다.";
    }
});

    
    //3. 회원가입 요청( 웹캠 촬영한 사진 전송)
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.querySelector("#username").value.trim();
        const user_id = document.querySelector("#user_id").value.trim();
        const password = document.querySelector("#password").value.trim();
        const confirm_password = document.querySelector("#confirm_password").value.trim();

        // 데이터 검증
        if (!username || !user_id || !password || !confirm_password) {
            messageBox.textContent = "모든 필드를 입력해야 합니다.";
            return;
        }

        if (password !== confirm_password) {
            messageBox.textContent = "비밀번호가 일치하지 않습니다.";
            return;
        }

        if (!capturedImage) {
            messageBox.textContent = "얼굴 사진을 촬영해주세요.";
            return;
        }

        const userData = {
            username,
            user_id,
            password,
            face_image: capturedImage, 
        };

        try {
            console.log("회원가입 요청 전송 중...");
            const response = await fetch("http://localhost:5000/register-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const contentType = response.headers.get("content-type");

            if (!response.ok) {
                console.error("서버 응답 오류:", response.status);
                messageBox.textContent = "회원가입 요청 실패. 서버를 확인하세요.";
                return;
            }
        

            const data = await response.json();

            if (!response.ok || !data.success) {  // 서버 응답이 실패한 경우 처리
                console.error("회원가입 오류:", data.message);
                messageBox.textContent = `회원가입 실패: ${data.message}`;
                messageBox.style.color = "red";
                return;
            }

            // 회원가입 성공 시 올바른 메시지를 표시
            messageBox.textContent = "회원가입 성공! 로그인 페이지로 이동하세요.";
            messageBox.style.color = "green";
    

            
            setTimeout(() => {
                const storedPreviousPage = sessionStorage.getItem("previousPage");
                if (storedPreviousPage && (storedPreviousPage.includes("hall") || storedPreviousPage.includes("takeout"))) {
                    console.log(`회원가입 후 이동할 페이지: ${storedPreviousPage}`);
                    window.location.href = storedPreviousPage;
                } else {
                    console.warn("이전 페이지 정보가 없어 기본 페이지로 이동");
                    window.location.href = "/hall_login.html"; // 기본 이동 경로
                }
            }, 2000);
            
        } catch (error) {
            console.error("회원가입 요청 실패:", error);
            messageBox.textContent = "서버에 연결할 수 없습니다.";
            messageBox.style.color = "red";
        }

        
    });
});


document.getElementById("goToLoginButton").addEventListener("click", function () {
    window.location.href = "/login";  // login.html이 아니라 /login으로 요청
});

