document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");
    const webcam = document.getElementById("webcam");
    const canvas = document.getElementById("capturedCanvas");
    const captureButton = document.getElementById("captureButton");

    let capturedImage = null; // 🔥 저장할 얼굴 이미지 (Base64)


    // 1.웹캠 활성화
    async function startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcam.srcObject = stream;
        } catch (error) {
            console.error("🚨 웹캠 접근 오류:", error);
            messageBox.textContent = "❌ 웹캠에 접근할 수 없습니다.";
        }
    }
    startWebcam();

    // 2.얼굴 촬영 기능
    captureButton.addEventListener("click", () => {
        const context = canvas.getContext("2d");
        canvas.width = webcam.videoWidth;
        canvas.height = webcam.videoHeight;
        context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
        capturedImage = canvas.toDataURL("image/jpeg"); // Base64로 변환
        messageBox.textContent = "✅ 얼굴 촬영 완료!";
    });

    if (!registerForm) {
        console.error("❌ 'registerForm' 요소를 찾을 수 없습니다. HTML을 확인하세요.");
        return;
    }
    //3. 회원가입 요청( 웹캠 촬영한 사진 전송)
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const user_id = document.getElementById("user_id").value;
        const password = document.getElementById("password").value;
        const confirm_password = document.getElementById("confirm_password").value;

        // 데이터 검증
        if (!username || !user_id || !password || !confirm_password) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (password !== confirm_password) {
            messageBox.textContent = "❌ 비밀번호가 일치하지 않습니다.";
            return;
        }

        if (!capturedImage) {
            messageBox.textContent = "❌ 얼굴 사진을 촬영해주세요.";
            return;
        }
        

        //const userData = { username, user_id, password, confirm_password };
        const formData = new FormData();
        formData.append("username", username);
        formData.append("user_id", user_id);
        formData.append("password", password);
        formData.append("face_image", capturedImage);  //  얼굴 사진 추가

        try {
            const response = await fetch("/api/register-user", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert("✅ 회원가입 성공! 로그인해주세요.");
                window.location.href = "/hall_login.html"; // 로그인 페이지로 이동
            } else {
                messageBox.textContent = `❌ 회원가입 실패: ${data.message}`;
            }
        } catch (error) {
            console.error("🚨 회원가입 요청 실패:", error);
            messageBox.textContent = "❌ 서버에 연결할 수 없습니다.";
        }
    });
});
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(userData),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 registerMessage.textContent = "✅ 회원가입 성공! 로그인 페이지로 이동하세요.";
//                 registerMessage.style.color = "green";
                
//             } else {
//                 registerMessage.textContent = "❌ " + data.error;
//                 registerMessage.style.color = "red";
//             }
//         } catch (error) {
//             console.error("회원가입 오류:", error);
//             registerMessage.textContent = "❌ 서버 오류가 발생했습니다.";
//             registerMessage.style.color = "red";
//         }
//     });
// });

document.getElementById("goToLoginButton").addEventListener("click", function () {
    window.location.href = "/login";  // ✅ login.html이 아니라 /login으로 요청
});

/*커밋*/